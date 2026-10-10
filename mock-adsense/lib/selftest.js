// Satu check untuk seluruh logika mock YouTube. Jalankan: node lib/selftest.js
// Tidak pakai framework — assert bawaan node cukup.

const assert = require('assert')
const { analyticsReport, channelsList, playlistItems } = require('./bureau-mock')
const { UPLOADS_PLAYLIST_ID, JUMLAH_PROFIL, profilByIndex } = require('./bureau-data')

const sp = (q) => new URLSearchParams(q)
let passed = 0
function ok(name, fn) {
  fn()
  passed++
  console.log('PASS', name)
}

const REPORTS_OK = 'ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views,estimatedRevenue&dimensions=month'

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
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&profil=0'), true).status, 400))
ok('reports 400 tanggal salah format', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=20260401&endDate=2026-09-01&metrics=views&profil=0'), true).status, 400))
ok('reports 400 metrik tak dikenal', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views,followers&profil=0'), true).status, 400))
ok('reports 400 dimensi tidak didukung', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views&dimensions=day&profil=0'), true).status, 400))
ok('reports 400 month tidak mulai tanggal 1', () =>
  assert.strictEqual(analyticsReport(sp('ids=channel==MINE&startDate=2026-04-15&endDate=2026-09-01&metrics=views&dimensions=month&profil=0'), true).status, 400))
ok('reports happy (profil 0): envelope, tipe kolom, 6 baris, Sep = 8400000', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&profil=0`), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.kind, 'youtubeAnalytics#resultTable')
  assert.deepStrictEqual(r.body.columnHeaders.map((h) => h.name), ['month', 'views', 'estimatedRevenue'])
  assert.deepStrictEqual(r.body.columnHeaders.map((h) => h.columnType), ['DIMENSION', 'METRIC', 'METRIC'])
  assert.strictEqual(r.body.columnHeaders[1].dataType, 'INTEGER')
  assert.strictEqual(r.body.columnHeaders[2].dataType, 'FLOAT')
  assert.strictEqual(r.body.rows.length, 6)
  assert.strictEqual(r.body.rows[5][2], 8400000)
})
ok('reports profil 12: Sep sesuai profilnya, bukan 8400000', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&profil=12`), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.rows[5][2], profilByIndex(12).monthly[5].estimatedRevenue)
  assert.notStrictEqual(r.body.rows[5][2], 8400000)
})
ok('reports rentang dipatuhi (3 baris)', () => {
  const r = analyticsReport(sp('ids=channel==MINE&startDate=2026-04-01&endDate=2026-06-01&metrics=views&dimensions=month&profil=0'), true)
  assert.strictEqual(r.body.rows.length, 3)
})
ok('reports sort -estimatedRevenue', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&profil=0&sort=-estimatedRevenue`), true)
  assert.strictEqual(r.body.rows[0][2], 8400000)
})
ok('reports rentang kosong: rows tidak ada', () => {
  const r = analyticsReport(sp('ids=channel==MINE&startDate=2027-04-01&endDate=2027-09-01&metrics=views&dimensions=month&profil=0'), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.rows, undefined)
})
ok('reports 400 profil di luar jangkauan', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&profil=99`), true)
  assert.strictEqual(r.status, 400)
  assert.strictEqual(r.body.error.errors[0].location, 'profil')
})
ok('reports 400 profil bukan angka', () => {
  const r = analyticsReport(sp(`${REPORTS_OK}&profil=abc`), true)
  assert.strictEqual(r.status, 400)
})

/* ---------- channels (Data v3) ---------- */
ok('channels mine=true (profil 0): bentuk lengkap, statistik string', () => {
  const r = channelsList(sp('part=snippet,contentDetails,statistics&mine=true&profil=0'), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.kind, 'youtube#channelListResponse')
  const it = r.body.items[0]
  assert.strictEqual(it.kind, 'youtube#channel')
  assert.strictEqual(it.snippet.title, 'Dapur Bagas')
  assert.strictEqual(typeof it.statistics.videoCount, 'string')
  assert.ok(it.contentDetails.relatedPlaylists.uploads.startsWith('UU'))
})
ok('channels profil 16 vs 17: skala statistik ikut profil (raksasa >> mikro)', () => {
  const besar = Number(channelsList(sp('part=statistics&mine=true&profil=16'), true).body.items[0].statistics.subscriberCount)
  const kecil = Number(channelsList(sp('part=statistics&mine=true&profil=17'), true).body.items[0].statistics.subscriberCount)
  assert.ok(besar > kecil * 100, `raksasa ${besar} harus >> mikro ${kecil}`)
})
ok('channels part=id tidak bocor bagian lain', () => {
  const r = channelsList(sp('part=id&mine=true&profil=0'), true)
  assert.strictEqual(r.body.items[0].snippet, undefined)
  assert.strictEqual(r.body.items[0].statistics, undefined)
})
ok('channels id tak dikenal: items kosong', () => {
  const r = channelsList(sp('part=snippet&id=UCbukanbukan&profil=0'), true)
  assert.deepStrictEqual(r.body.items, [])
})
ok('channels 400 tanpa mine/id', () => assert.strictEqual(channelsList(sp('part=snippet&profil=0'), true).status, 400))
ok('channels 400 part tak dikenal', () => assert.strictEqual(channelsList(sp('part=brandingSettings&mine=true&profil=0'), true).status, 400))
ok('channels 400 profil di luar jangkauan', () =>
  assert.strictEqual(channelsList(sp('part=snippet&mine=true&profil=20'), true).status, 400))

/* ---------- playlistItems (Data v3) ---------- */
ok('playlistItems 400 tanpa playlistId', () => assert.strictEqual(playlistItems(sp('part=snippet&profil=0'), true).status, 400))
ok('playlistItems 404 playlist tak dikenal', () => {
  const r = playlistItems(sp('part=snippet&playlistId=UUsalah&profil=0'), true)
  assert.strictEqual(r.status, 404)
  assert.strictEqual(r.body.error.errors[0].reason, 'playlistNotFound')
})
ok('playlistItems halaman 1 (profil 0): 50 item + nextPageToken + totalResults 1104', () => {
  const r = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&profil=0`), true)
  assert.strictEqual(r.status, 200)
  assert.strictEqual(r.body.kind, 'youtube#playlistItemListResponse')
  assert.strictEqual(r.body.items.length, 50)
  assert.strictEqual(r.body.pageInfo.totalResults, 1104)
  assert.ok(r.body.nextPageToken)
  assert.ok(r.body.items[0].snippet.publishedAt.startsWith('2026-10-06'))
  assert.strictEqual(r.body.items[0].snippet.resourceId.kind, 'youtube#video')
})
ok('playlistItems halaman 2: lanjut lebih tua', () => {
  const p1 = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&profil=0`), true)
  const p2 = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&pageToken=${p1.body.nextPageToken}&profil=0`), true)
  assert.strictEqual(p2.status, 200)
  assert.strictEqual(p2.body.items.length, 50)
  assert.ok(p2.body.items[0].snippet.publishedAt < p1.body.items.at(-1).snippet.publishedAt)
})
ok('playlistItems profil lain: 100 item tetap utuh', () => {
  const p1 = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&profil=19`), true)
  const p2 = playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&pageToken=${p1.body.nextPageToken}&profil=19`), true)
  assert.strictEqual(p1.body.items.length + p2.body.items.length, 100)
})
ok('playlistItems maxResults=51 ditolak', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=51&profil=0`), true).status, 400))
ok('playlistItems pageToken asal ditolak', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&pageToken=hoax&profil=0`), true).status, 400))
ok('playlistItems default maxResults = 5', () =>
  assert.strictEqual(playlistItems(sp(`part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&profil=0`), true).body.items.length, 5))

/* ---------- matriks 20 profil: sinyal sesuai klaster ---------- */

function median(a) {
  const s = [...a].sort((x, y) => x - y)
  const t = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? s[t] : (s[t - 1] + s[t]) / 2
}

function hitungSinyal(monthly, uploadDates) {
  const rev = monthly.map((r) => r.estimatedRevenue)
  const views = monthly.map((r) => r.views)
  let streak = 0
  for (let i = rev.length - 1; i > 0; i--) {
    if (rev[i] > rev[i - 1]) streak++
    else break
  }
  const mean = rev.reduce((a, b) => a + b, 0) / rev.length
  const cv = (Math.sqrt(rev.reduce((a, b) => a + (b - mean) ** 2, 0) / rev.length) / mean) * 100
  const HARI = 86400000
  const REF = Date.UTC(2026, 9, 9)
  const senin = (t) => {
    const d = new Date(t)
    const u = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    return u - ((d.getUTCDay() + 6) % 7) * HARI
  }
  const awal = senin(REF) - 25 * 7 * HARI
  const pekan = new Set()
  for (const t of uploadDates) {
    const s = senin(`${t}T00:00:00Z`)
    if (s >= awal && s <= senin(REF)) pekan.add(s)
  }
  const pct = (pekan.size / 26) * 100
  const rViews = views[views.length - 1] / median(views.slice(0, -1))
  const rpm = rev.map((r, i) => r / views[i])
  const rRpm = rpm[rpm.length - 1] / median(rpm.slice(0, -1))
  const poin =
    (streak >= 3 ? 20 : streak === 2 ? 14 : streak === 1 ? 8 : 0) +
    (cv <= 15 ? 20 : cv <= 30 ? 12 : cv <= 50 ? 5 : 0) +
    (pct >= 80 ? 20 : pct >= 60 ? 12 : pct >= 40 ? 6 : 0) +
    (rViews > 2.5 ? 0 : rViews > 1.5 ? 10 : 20) +
    (rRpm >= 0.95 ? 20 : rRpm >= 0.8 ? 12 : 4)
  return { streak, cv, pct, rViews, rRpm, poin }
}

// [klaster, min, max] skor sinyal per profil (profil 18: tier B datang dari
// aturan "channel baru" di engine webapp, bukan dari sinyal)
const KLASTER = [
  ['A', 80, 100], ['A', 80, 100], ['A', 80, 100], ['A', 80, 100], ['A', 80, 100], ['A', 80, 100],
  ['B', 60, 79], ['B', 60, 79], ['B', 60, 79], ['B', 60, 79], ['B', 60, 79],
  ['C', 0, 59], ['C', 0, 59], ['C', 0, 59], ['C', 0, 59], ['C', 0, 59],
  ['A', 80, 100], ['A', 80, 100], ['A', 80, 100], ['C', 0, 59],
]

for (let i = 0; i < JUMLAH_PROFIL; i++) {
  ok(`matriks profil ${i} (${profilByIndex(i).label}): klaster ${KLASTER[i][0]}`, () => {
    const p = profilByIndex(i)
    const s = hitungSinyal(p.monthly, p.recentUploadDates)
    const [, min, max] = KLASTER[i]
    assert.ok(
      s.poin >= min && s.poin <= max,
      `skor sinyal ${s.poin} di luar ${min}-${max} (streak ${s.streak}, CV ${s.cv.toFixed(1)}%, upload ${s.pct.toFixed(1)}%, rViews ${s.rViews.toFixed(2)}, rRpm ${s.rRpm.toFixed(2)})`,
    )
  })
}

console.log(`\n${passed} PASS`)
