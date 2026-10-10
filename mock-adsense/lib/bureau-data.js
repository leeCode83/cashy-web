// Dataset mock YouTube untuk bureau CashQ — 20 profil data bergilir.
// Profil 0 = data asli Dapur Bagas (hardcoded; satu realitas dengan
// data/payments.json untuk demo zkTLS). Profil 1-19 parametrik: bentuk deret
// dari yang mirip Dapur Bagas sampai beda jauh (raksasa, mikro, sekarat).
// NAMA CHANNEL SENGAJA TIDAK BERUBAH di semua profil (keputusan user).

const CHANNEL_ID = 'UCdJrQE8dnNodLwN2nFjMhxQ'
const UPLOADS_PLAYLIST_ID = 'UUdJrQE8dnNodLwN2nFjMhxQ'

const IDENTITAS = {
  title: 'Dapur Bagas',
  description: 'Resep masakan rumahan yang bisa dipraktikkan siapa saja. Video baru tiap minggu.',
  customUrl: '@dapurbagas',
  country: 'ID',
}

const BULAN = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']

// ---------- profil 0: Dapur Bagas eksak (jangan berubah) ----------

const MONTHLY_0 = [
  { month: '2026-04', views: 618342, estimatedRevenue: 5984200 },
  { month: '2026-05', views: 695218, estimatedRevenue: 6730500 },
  { month: '2026-06', views: 664119, estimatedRevenue: 6412800 },
  { month: '2026-07', views: 754306, estimatedRevenue: 7286100 },
  { month: '2026-08', views: 820147, estimatedRevenue: 7918400 },
  { month: '2026-09', views: 869825, estimatedRevenue: 8400000 },
]

const TANGGAL_0 = [
  '2026-10-06', '2026-09-28', '2026-09-21', '2026-09-14', '2026-09-07', '2026-09-01',
  '2026-08-24', '2026-08-17', '2026-08-10', '2026-08-03', '2026-07-27', '2026-07-20',
  '2026-07-13', '2026-07-06', '2026-06-29', '2026-06-22', '2026-06-10', '2026-06-01',
  '2026-05-25', '2026-05-18', '2026-05-06', '2026-04-27',
]

const STATS_0 = {
  viewCount: '842311057',
  subscriberCount: '1180000', // dibulatkan 3 digit publik, cocok dengan "1,18 jt"
  hiddenSubscriberCount: false,
  videoCount: '1104',
}

const PUBLISHED_0 = '2019-03-14'

// 78 video lebih lama (gap pertama besar supaya semua di luar jendela 26 pekan)
const OLDER_GAPS_0 = [18, 4, 3, 5, 4, 6, 3]
const TANGGAL_LAMA_0 = (() => {
  const hasil = []
  let hari = 0
  for (let k = 0; k < 78; k++) {
    hari += OLDER_GAPS_0[k % OLDER_GAPS_0.length]
    const d = new Date('2026-04-27T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - hari)
    hasil.push(d.toISOString().slice(0, 10))
  }
  return hasil
})()

const DATES_0 = [...TANGGAL_0, ...TANGGAL_LAMA_0]

// ---------- profil parametrik 1-19 ----------
// m = pola 6 bulan pendapatan (relatif basis); rho = rasio RPM bulan terakhir
// terhadap median (views bulan terakhir ikut melar); uploads = berapa pekan
// ber-upload dalam 26 pekan terakhir. Klaster A sehat, B menengah, C lemah,
// D ekstrem (lihat selftest untuk target sinyal per profil).

const PROFIL = [
  null, // 0 = eksak di atas
  { label: 'bagas-mirip', basis: 6_580_000, m: [1, 1.09, 1.05, 1.14, 1.23, 1.31], rho: 1.0, uploads: 22, publishedAt: '2021-08-02', rpm: 9.4 },
  { label: 'edukasi', basis: 9_200_000, m: [1, 1.05, 1.1, 1.16, 1.22, 1.28], rho: 0.97, uploads: 24, publishedAt: '2020-06-19', rpm: 10.2 },
  { label: 'travel', basis: 12_400_000, m: [1, 1.06, 1.1, 1.14, 1.18, 1.25], rho: 0.98, uploads: 23, publishedAt: '2018-11-30', rpm: 8.7 },
  { label: 'fitnes-naik-cepat', basis: 6_400_000, m: [1, 1.05, 1.1, 1.16, 1.24, 1.6], rho: 0.96, uploads: 22, publishedAt: '2022-04-17', rpm: 9.1 },
  { label: 'gadget', basis: 15_600_000, m: [1, 1.07, 1.12, 1.18, 1.24, 1.3], rho: 0.98, uploads: 23, publishedAt: '2019-09-08', rpm: 10.8 },
  { label: 'volatil-b', basis: 3_800_000, m: [1, 1.32, 0.84, 1.26, 0.92, 1.2], rho: 0.97, uploads: 15, publishedAt: '2023-02-21', rpm: 8.9 },
  { label: 'datar-rpm-turun', basis: 22_000_000, m: [1, 0.98, 1.02, 0.99, 1.01, 1.0], rho: 0.88, uploads: 23, publishedAt: '2017-07-14', rpm: 9.8 },
  { label: 'spike-sedang', basis: 8_800_000, m: [1, 1.0, 1.0, 1.0, 1.0, 2.0], rho: 1.0, uploads: 22, publishedAt: '2022-10-05', rpm: 9.2 },
  { label: 'jarang-upload', basis: 5_200_000, m: [1, 1.09, 1.04, 1.12, 1.19, 1.27], rho: 0.84, uploads: 14, publishedAt: '2021-01-26', rpm: 9.5 },
  { label: 'pelan-rpm-turun', basis: 18_000_000, m: [1, 1.06, 1.02, 1.08, 1.05, 1.1], rho: 0.87, uploads: 15, publishedAt: '2020-03-03', rpm: 10.5 },
  { label: 'turun-c', basis: 9_600_000, m: [1.15, 0.55, 0.98, 0.5, 0.92, 0.45], rho: 0.72, uploads: 23, publishedAt: '2019-12-12', rpm: 9.0 },
  { label: 'spike-palsu', basis: 4_400_000, m: [1, 1.0, 1.0, 1.0, 1.0, 1.0], rho: 0.333, uploads: 9, publishedAt: '2023-08-15', rpm: 9.3, tanpaJitterRevenue: true },
  { label: 'sekarat', basis: 1_100_000, m: [1, 0.86, 0.72, 0.6, 0.5, 0.42], rho: 0.88, uploads: 5, publishedAt: '2018-05-27', rpm: 8.4 },
  { label: 'anjlok-rpm', basis: 7_700_000, m: [1, 1.06, 1.12, 1.18, 1.24, 1.3], rho: 0.45, uploads: 15, publishedAt: '2021-11-09', rpm: 9.7 },
  { label: 'turun-berat', basis: 2_600_000, m: [1, 0.88, 0.76, 0.66, 0.58, 0.5], rho: 0.85, uploads: 7, publishedAt: '2022-06-23', rpm: 8.2 },
  { label: 'raksasa', basis: 680_000_000, m: [1, 1.07, 1.12, 1.18, 1.24, 1.32], rho: 0.98, uploads: 24, publishedAt: '2016-03-08', rpm: 11.4 },
  { label: 'mikro', basis: 320_000, m: [1, 1.1, 1.05, 1.16, 1.22, 1.3], rho: 0.99, uploads: 21, publishedAt: '2024-09-30', rpm: 8.6 },
  { label: 'channel-baru', basis: 2_200_000, m: [1, 1.1, 1.05, 1.15, 1.22, 1.3], rho: 0.99, uploads: 20, publishedAt: '2026-05-08', rpm: 8.8 },
  { label: 'zombie', basis: 900_000, m: [1, 0.9, 0.8, 0.7, 0.6, 0.5], rho: 0.7, uploads: 2, publishedAt: '2017-01-19', rpm: 7.9 },
]

const JUMLAH_PROFIL = PROFIL.length

// ---------- generator deterministik ----------

function lcg(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function id11(rand) {
  let out = ''
  for (let i = 0; i < 11; i++) out += B62[Math.floor(rand() * B62.length)]
  return out
}

const HARI = 86_400_000
// hari "sekarang" demo — tetap, supaya semua profil deterministik
const REF_DEMO = Date.UTC(2026, 9, 9)
const AWAL_JENDELA = REF_DEMO - 181 * HARI // Senin 26 pekan ke belakang

function bangunBulanan(p, rand) {
  return p.m.map((mult, i) => {
    const jitterRevenue = p.tanpaJitterRevenue ? 1 : 1 + (rand() - 0.5) * 0.008
    const revenue = Math.max(1, Math.round(p.basis * mult * jitterRevenue))
    const drift = i === 5 ? p.rho : 1
    const views = Math.max(1, Math.round((revenue / (p.rpm * drift)) * (1 + (rand() - 0.5) * 0.03)))
    return { month: BULAN[i], views, estimatedRevenue: revenue }
  })
}

// W upload terbaru menempati W pekan terakhir (satu per pekan); sisanya
// seluruhnya sebelum awal jendela 26 pekan supaya hitungan konsistensi eksak.
function bangunTanggal(p, rand) {
  const seninIni = REF_DEMO - ((new Date(REF_DEMO).getUTCDay() + 6) % 7) * HARI
  const hasil = []
  for (let k = 0; k < p.uploads; k++) {
    hasil.push(new Date(seninIni - k * 7 * HARI + Math.floor(rand() * 4) * HARI).toISOString().slice(0, 10))
  }
  let t = AWAL_JENDELA - Math.floor(3 + rand() * 6) * HARI
  while (hasil.length < 100) {
    hasil.push(new Date(t).toISOString().slice(0, 10))
    t -= Math.floor(4 + rand() * 3) * HARI
  }
  return hasil
}

const TITLES = [
  'Rendang 45 Menit, Bumbu Instan',
  'Sambal Ikan Bakar Rasa Warung',
  'Ayam Geprek Kriuk Tahan Lama',
  'Nasi Goreng Kampung Autentik',
  'Es Teh Jumbo Anti Ceper',
  'Mie Ayam Kuat Kaldu',
  'Martabak Mini Anti Gagal',
  'Soto Ayam Bening Pekat',
  'Bakso Urat Kenyal Tanpa Boraks',
  'Terong Balado Manis Pedas',
  'Pisang Goreng Crispy Tahan Renyah',
  'Sayur Asem Segar Ala Resto',
]

function bangunItems(dates, seed) {
  return dates.map((date, i) => {
    const rand = lcg(seed + i * 7919)
    const hh = ['09', '13', '16', '11', '15', '10'][i % 6]
    const suffix = i >= TITLES.length ? ` (Bagian ${Math.floor(i / TITLES.length) + 1})` : ''
    return {
      id: 'UEx' + id11(rand),
      videoId: id11(rand),
      publishedAt: `${date}T${hh}:${String((i * 7) % 60).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}Z`,
      title: TITLES[i % TITLES.length] + suffix,
      position: i,
    }
  })
}

function bulanSejak(publishedAt, ref) {
  const t = new Date(publishedAt)
  const bulan = (ref.getUTCFullYear() - t.getUTCFullYear()) * 12 + (ref.getUTCMonth() - t.getUTCMonth())
  return ref.getUTCDate() < t.getUTCDate() ? bulan - 1 : bulan
}

function profilByIndex(i) {
  if (i === 0) {
    return {
      label: 'bagas-utama',
      monthly: MONTHLY_0,
      recentUploadDates: TANGGAL_0,
      items: bangunItems(DATES_0, 1234),
      statistics: STATS_0,
      publishedAt: PUBLISHED_0,
      totalResults: 1104,
    }
  }
  const p = PROFIL[i]
  if (!p) throw new Error(`profil ${i} tidak ada`)
  const rand = lcg(9000 + i * 104729)
  const monthly = bangunBulanan(p, rand)
  const dates = bangunTanggal(p, rand)
  const vLast = monthly[monthly.length - 1].views
  const usia = Math.max(1, bulanSejak(p.publishedAt, new Date(REF_DEMO)))
  const statistics = {
    viewCount: String(Math.round(vLast * (96 + rand() * 40))),
    subscriberCount: String(Math.max(50, Math.round(vLast / (2.6 + rand() * 1.8)))),
    hiddenSubscriberCount: false,
    videoCount: String(Math.max(12, Math.round((usia * p.uploads * 30) / 26 / 7 + rand() * 30))),
  }
  return {
    label: p.label,
    monthly,
    recentUploadDates: dates,
    items: bangunItems(dates, 9000 + i * 104729),
    statistics,
    publishedAt: p.publishedAt,
    totalResults: Number(statistics.videoCount),
  }
}

function channelByIndex(i) {
  const p = profilByIndex(i)
  return {
    id: CHANNEL_ID,
    snippet: { ...IDENTITAS, publishedAt: p.publishedAt },
    contentDetails: { relatedPlaylists: { likes: '', uploads: UPLOADS_PLAYLIST_ID } },
    statistics: p.statistics,
  }
}

// ---------- ekspor lama (kompatibel selftest/mock sebelum migrasi profil) ----------

module.exports = {
  CHANNEL_ID,
  UPLOADS_PLAYLIST_ID,
  JUMLAH_PROFIL,
  profilByIndex,
  channelByIndex,
  channel: channelByIndex(0),
  monthly: MONTHLY_0,
  playlistItems: bangunItems(DATES_0, 1234),
  totalResults: 1104,
}
