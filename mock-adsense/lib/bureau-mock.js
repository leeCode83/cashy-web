// Logika murni mock YouTube API: (URLSearchParams, hasAuth) -> { status, body }.
// Tidak ada dependensi Vercel di sini supaya bisa dites langsung via node
// (lib/selftest.js). Bentuk respons dan error mengikuti envelope Google asli.

const data = require('./bureau-data')

const METRICS = { views: 'INTEGER', estimatedRevenue: 'FLOAT' }
const ETAG_CHANNEL = 'eq-B1gO8vWQxY9kQ2mLpA4'
const ETAG_PLAYLIST = 'pR7wTn2KcQ1mZ3xHb8LsE9'

function gErr(status, reason, message, location) {
  const body = {
    code: status,
    message,
    errors: [{ message, domain: 'global', reason }],
    status:
      status === 401 ? 'UNAUTHENTICATED' :
      status === 404 ? 'NOT_FOUND' :
      'INVALID_ARGUMENT',
  }
  if (location) Object.assign(body.errors[0], { locationType: 'parameter', location })
  return { error: body }
}

const NO_AUTH = {
  status: 401,
  body: gErr(
    401,
    'required',
    'Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential.',
  ),
}

const badParam = (message, location) => ({ status: 400, body: gErr(400, 'invalidParameter', message, location) })
const requiredParam = (name) => ({ status: 400, body: gErr(400, 'required', `Required parameter: ${name}`, name) })

/**
 * Indeks profil data (0-19). Tanpa parameter: rotasi waktu per detik supaya
 * curl langsung ikut bergilir. Service CashQ meneruskan indeks eksplisit
 * supaya ketiga endpoint dalam satu snapshot konsisten satu profil.
 */
function indeksProfil(sp) {
  const raw = sp.get('profil')
  if (raw === null || raw === '') {
    return { indeks: Math.floor(Date.now() / 1000) % data.JUMLAH_PROFIL }
  }
  if (!/^\d+$/.test(raw) || Number(raw) >= data.JUMLAH_PROFIL) {
    return {
      error: badParam(
        `Invalid value '${raw}' for parameter profil. Expected an integer from 0 to ${data.JUMLAH_PROFIL - 1}.`,
        'profil',
      ),
    }
  }
  return { indeks: Number(raw) }
}

function partsOf(sp, param, allowed) {
  const raw = sp.get(param)
  if (!raw) return { error: requiredParam(param) }
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  const bad = parts.find((p) => !allowed[p])
  if (bad) return { error: badParam(`Invalid value '${bad}' for parameter ${param}. Supported values: ${['id', ...Object.keys(allowed)].join(', ')}.`, param) }
  return { parts }
}

// ---------- YouTube Analytics API v2: GET /v2/reports ----------

function analyticsReport(sp, hasAuth) {
  if (!hasAuth) return NO_AUTH
  const pf = indeksProfil(sp)
  if (pf.error) return pf.error
  const bulanan = data.profilByIndex(pf.indeks).monthly

  for (const p of ['ids', 'startDate', 'endDate', 'metrics']) {
    if (!sp.get(p)) return requiredParam(p)
  }
  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  for (const p of ['startDate', 'endDate']) {
    if (!dateRe.test(sp.get(p)))
      return badParam(`Invalid value '${sp.get(p)}' for parameter ${p}. Dates must use YYYY-MM-DD format.`, p)
  }

  const metrics = sp.get('metrics').split(',').map((s) => s.trim()).filter(Boolean)
  const unknown = metrics.find((m) => !METRICS[m])
  if (unknown)
    return badParam(`Invalid value '${unknown}' for parameter metrics. Supported values: ${Object.keys(METRICS).join(', ')}.`, 'metrics')

  const dimsRaw = sp.get('dimensions') || ''
  const dims = dimsRaw.split(',').map((s) => s.trim()).filter(Boolean)
  const badDim = dims.find((d) => d !== 'month')
  if (badDim)
    return badParam(`Invalid value '${badDim}' for parameter dimensions. Mock ini hanya mendukung dimensi month.`, 'dimensions')
  // Aturan asli API: dengan dimensi month, kedua tanggal wajib tanggal 1.
  if (dims.includes('month')) {
    for (const p of ['startDate', 'endDate']) {
      if (!/^\d{4}-\d{2}-01$/.test(sp.get(p)))
        return badParam(`If the month dimension is requested, ${p} must be the first day of the month.`, p)
    }
  }

  const headers = [
    ...dims.map((d) => ({ name: d, columnType: 'DIMENSION', dataType: 'STRING' })),
    ...metrics.map((m) => ({ name: m, columnType: 'METRIC', dataType: METRICS[m] })),
  ]

  const from = sp.get('startDate').slice(0, 7)
  const to = sp.get('endDate').slice(0, 7)
  let rows = bulanan
    .filter((r) => r.month >= from && r.month <= to)
    .map((r) => [...dims.map((d) => r[d]), ...metrics.map((m) => r[m])])

  const sortRaw = sp.get('sort') || ''
  const sortField = sortRaw.replace(/^-/, '')
  if (sortField) {
    if (!headers.some((h) => h.name === sortField))
      return badParam(`Invalid value '${sortField}' for parameter sort.`, 'sort')
    const col = headers.findIndex((h) => h.name === sortField)
    const dir = sortRaw.startsWith('-') ? -1 : 1
    rows = [...rows].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * dir)
  }

  // ponytail: currency/filters/maxResults/startIndex diterima lalu diabaikan —
  // dataset hanya 6 baris bulanan; tambahkan bila bureau butuh lebih.
  const body = { kind: 'youtubeAnalytics#resultTable', columnHeaders: headers }
  if (rows.length) body.rows = rows
  return { status: 200, body }
}

// ---------- YouTube Data API v3: GET /v3/channels ----------

function channelsList(sp, hasAuth) {
  if (!hasAuth) return NO_AUTH
  const pf = indeksProfil(sp)
  if (pf.error) return pf.error
  const kanal = data.channelByIndex(pf.indeks)

  const { parts, error } = partsOf(sp, 'part', { id: 1, snippet: 1, contentDetails: 1, statistics: 1 })
  if (error) return error

  const mine = sp.get('mine') === 'true'
  const id = sp.get('id')
  if (!mine && !id)
    return { status: 400, body: gErr(400, 'required', 'The request must specify one of the parameters: id, mine.', 'mine') }

  let items = []
  if (mine || id === data.CHANNEL_ID) {
    const ch = { kind: 'youtube#channel', etag: ETAG_CHANNEL, id: kanal.id }
    for (const p of parts) if (kanal[p]) ch[p] = kanal[p]
    items = [ch]
  }
  return {
    status: 200,
    body: {
      kind: 'youtube#channelListResponse',
      etag: ETAG_CHANNEL,
      pageInfo: { totalResults: items.length, resultsPerPage: 1 },
      items,
    },
  }
}

// ---------- YouTube Data API v3: GET /v3/playlistItems ----------

function playlistItems(sp, hasAuth) {
  if (!hasAuth) return NO_AUTH
  const pf = indeksProfil(sp)
  if (pf.error) return pf.error
  const profil = data.profilByIndex(pf.indeks)

  const { parts, error } = partsOf(sp, 'part', { id: 1, snippet: 1, contentDetails: 1 })
  if (error) return error

  const pid = sp.get('playlistId')
  if (!pid) return requiredParam('playlistId')
  if (pid !== data.UPLOADS_PLAYLIST_ID)
    return {
      status: 404,
      body: gErr(404, 'playlistNotFound', "The playlist identified with the request's playlistId parameter cannot be found."),
    }

  const maxRaw = sp.get('maxResults') || '5'
  if (!/^\d+$/.test(maxRaw) || +maxRaw < 1 || +maxRaw > 50)
    return badParam('The maxResults parameter specifies an integer from 1 to 50.', 'maxResults')
  const max = +maxRaw

  let offset = 0
  const token = sp.get('pageToken')
  if (token) {
    const m = /^PT(\d+)$/.exec(token)
    if (!m) return badParam('The request specifies an invalid page token.', 'pageToken')
    offset = +m[1]
  }

  const items = profil.items.slice(offset, offset + max).map((it) => {
    const obj = { kind: 'youtube#playlistItem', etag: ETAG_PLAYLIST, id: it.id }
    for (const p of parts) {
      if (p === 'snippet')
        obj.snippet = {
          publishedAt: it.publishedAt,
          channelId: data.CHANNEL_ID,
          title: it.title,
          description: '',
          position: it.position,
          resourceId: { kind: 'youtube#video', videoId: it.videoId },
        }
      if (p === 'contentDetails')
        obj.contentDetails = { videoId: it.videoId, videoPublishedAt: it.publishedAt }
    }
    return obj
  })

  const body = {
    kind: 'youtube#playlistItemListResponse',
    etag: ETAG_PLAYLIST,
    pageInfo: { totalResults: profil.totalResults, resultsPerPage: max },
    items,
  }
  // ponytail: paginasi berhenti di 100 item yang dihasilkan; totalResults
  // tetap melaporkan angka channel masing-masing profil.
  if (offset + max < profil.items.length) body.nextPageToken = `PT${offset + max}`
  return { status: 200, body }
}

// ---------- pembungkus untuk Vercel functions ----------

function serve(req, res, fn) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }
  const auth = req.headers.authorization || ''
  const hasAuth = auth.startsWith('Bearer ') && auth.length > 7
  const sp = new URL(req.url, 'http://localhost').searchParams
  const { status, body } = fn(sp, hasAuth)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=UTF-8')
  res.end(JSON.stringify(body))
}

module.exports = { analyticsReport, channelsList, playlistItems, serve }
