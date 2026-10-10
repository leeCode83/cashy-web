// Satu check untuk seluruh logika mock YouTube. Jalankan: node lib/selftest.js
// Tidak pakai framework — assert bawaan node cukup.

const assert = require('assert')
const { analyticsReport, channelsList, playlistItems } = require('./bureau-mock')
const { UPLOADS_PLAYLIST_ID } = require('./bureau-data')

const sp = (q) => new URLSearchParams(q)
let passed = 0
function ok(name, fn) {
  fn()
  passed++
  console.log('PASS', name)
}

const REPORTS_OK = 'ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views,estimatedRevenue'

/* ---------- auth ---------- */
ok('reports 401 tanpa token', () => {
  const r = analyticsReport(sp(REPORTS_OK), false)
  assert.strictEqual(r.status, 401)
  assert.strictEqual(r.body.error.status, 'UNAUTHENTICATED')
})
ok('channels 401 tanpa token', () => assert.strictEqual(channelsList(sp('part=snippet&mine=true'), false).status, 401))
ok('playlistItems 401 tanpa token', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}`), false).status, 401))

/* ---------- reports (Analytics v2) ---------- */
ok('reports 400 param wajib kurang', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01'), true).status, 400))
ok('reports 400 tanggal salah format', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=20260401&endDate=2026-09-01&metrics=views'), true).status, 400))
ok('reports 400 metrik tak dikenal', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views,followers'), true).status, 400))
ok('reports 400 dimensi tidak didukung', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views&dimensions=day'), true).status, 400))
ok('reports 400 month tidak mulai tanggal 1', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-15&endDate=2026-09-01&metrics=views&dimensions=month'), true).status, 400))
ok('reports happy: envelope, tipe kolom, 6 baris, Sep = 8400000', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&dimensions=month`), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.kind, 'youtubeAnalytics#resultTable')
  assert.deepStrictEqual(r.body.columnHeaders.map((h) => h.name), ['month', 'views', 'estimatedRevenue'])
  assert.deepStrictEqual(r.body.columnHeaders.map((h) => h.columnType), ['DIMENSION', 'METRIC', 'METRIC'])
  assert.strictEqual(r.body.columnHeaders[1].dataType, 'INTEGER')
  assert.strictEqual(r.body.columnHeaders[2].dataType, 'FLOAT')
  assert.strictEqual(r.body.rows.length, 6)
  assert.strictEqual(r.body.rows[5][2], 8400000)
})
ok('reports rentang dipatuhi (3 baris)', () => {
  const r = analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&endDate=2026-06-01&metrics=views&dimensions=month'), true)
  assert.strictEqual(r.body.rows.length, 3)
})
ok('reports sort -estimatedRevenue', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&dimensions=month&sort=-estimatedRevenue`), true)
  assert.strictEqual(r.body.rows[0][2], 8400000)
})
ok('reports rentang kosong: rows tidak ada', () => {
  const r = analyticsReport(sp('ids=channel==MINE&startDate=2027-04-01&endDate=2027-09-01&metrics=views&dimensions=month'), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.rows, undefined)
})

/* ---------- channels (Data v3) ---------- */
ok('channels mine=true: bentuk lengkap, statistik string', () => {
  const r = channelsList(sp('part=snippet,contentDetails,statistics&mine=true'), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.kind, 'youtube#channelListResponse')
  const it = r.body.items[0]
  assert.strictEqual(it.kind, 'youtube#channel')
  assert.strictEqual(it.snippet.title, 'Dapur Bagas')
  assert.strictEqual(typeof it.statistics.videoCount, 'string')
  assert.ok(it.contentDetails.relatedPlaylists.uploads.startsWith('UU'))
})
ok('channels part=id tidak bocor bagian lain', () => {
  const r = channelsList(sp('part=id&mine=true'), true)
  assert.strictEqual(r.body.items[0].snippet, undefined)
  assert.strictEqual(r.body.items[0].statistics, undefined)
})
ok('channels id tak dikenal: items kosong', () => {
  const r = channelsList(sp('part=snippet&id=UCbukanbukan'), true)
  assert.deepStrictEqual(r.body.items, [])
})
ok('channels 400 tanpa mine/id', () => assert.strictEqual(channelsList(sp('part=snippet'), true).status, 400))
ok('channels 400 part tak dikenal', () => assert.strictEqual(channelsList(sp('part=brandingSettings&mine=true'), true).status, 400))

/* ---------- playlistItems (Data v3) ---------- */
ok('playlistItems 400 tanpa playlistId', () => assert.strictEqual(playlistItems(sp('part=snippet'), true).status, 400))
ok('playlistItems 404 playlist tak dikenal', () => {
  const r = playlistItems(sp('part=snippet&playlistId=UUsalah'), true)
  assert.strictEqual(r.status, 404)
  assert.strictEqual(r.body.error.errors[0].reason, 'playlistNotFound')
})
ok('playlistItems halaman 1: 50 item + nextPageToken + totalResults 1104', () => {
  const r = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50`), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.kind, 'youtube#playlistItemListResponse')
  assert.strictEqual(r.body.items.length, 50)
  assert.strictEqual(r.body.pageInfo.totalResults, 1104)
  assert.ok(r.body.nextPageToken)
  assert.ok(r.body.items[0].snippet.publishedAt.startsWith('2026-10-06'))
  assert.strictEqual(r.body.items[0].snippet.resourceId.kind, 'youtube#video')
})
ok('playlistItems halaman 2: lanjut lebih tua', () => {
  const p1 = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50`), true)
  const p2 = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&pageToken=${p1.body.nextPageToken}`), true)
  assert.strictEqual(p2.status, 200)
  assert.strictEqual(p2.body.items.length, 50)
  assert.ok(p2.body.items[0].snippet.publishedAt < p1.body.items.at(-1).snippet.publishedAt)
})
ok('playlistItems maxResults=51 ditolak', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=51`), true).status, 400))
ok('playlistItems pageToken asal ditolak', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&pageToken=hoax`), true).status, 400))
ok('playlistItems default maxResults = 5', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}`), true).body.items.length, 5))

console.log(`\n${passed} PASS`)
