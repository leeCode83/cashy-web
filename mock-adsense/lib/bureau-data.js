// Dataset bersama untuk mock YouTube API (bureau CashQ). Semua endpoint di
// api/youtube/ membaca dari file ini, jadi perubahan angka cukup satu tempat.
// Bentuk nilai meniru API asli: statistik berupa string, tanggal ISO 8601 UTC,
// id channel UC… dan uploads playlist UU… dengan relasi UC->UU seperti aslinya.

const CHANNEL_ID = 'UCdJrQE8dnNodLwN2nFjMhxQ'
const UPLOADS_PLAYLIST_ID = 'UUdJrQE8dnNodLwN2nFjMhxQ'

const channel = {
  id: CHANNEL_ID,
  snippet: {
    title: 'Dapur Bagas',
    description: 'Resep masakan rumahan yang bisa dipraktikkan siapa saja. Video baru tiap minggu.',
    customUrl: '@dapurbagas',
    publishedAt: '2019-03-14T06:12:45Z',
    country: 'ID',
  },
  contentDetails: { relatedPlaylists: { likes: '', uploads: UPLOADS_PLAYLIST_ID } },
  // API asli mengembalikan statistik sebagai string (uint64 di JSON).
  statistics: {
    viewCount: '842311057',
    subscriberCount: '1180000', // dibulatkan 3 digit publik, cocok dengan "1,18 jt"
    hiddenSubscriberCount: false,
    videoCount: '1104',
  },
}

// Pendapatan dan views bulanan Apr-Sep 2026, sebagaimana Analytics API.
// Sep sengaja 8.400.000 = balance_final di data/payments.json (bukti zkTLS),
// supaya bureau dan proof TransGate bercerita satu angka yang sama.
// Views dipilih agar RPM (~USD 0,60) stabil: dasar sinyal "niche stabil" bureau.
const monthly = [
  { month: '2026-04', views: 618342, estimatedRevenue: 5984200 },
  { month: '2026-05', views: 695218, estimatedRevenue: 6730500 },
  { month: '2026-06', views: 664119, estimatedRevenue: 6412800 },
  { month: '2026-07', views: 754306, estimatedRevenue: 7286100 },
  { month: '2026-08', views: 820147, estimatedRevenue: 7918400 },
  { month: '2026-09', views: 869825, estimatedRevenue: 8400000 },
]

// 22 upload terakhir (terbaru dulu) yang menempati 26 minggu terakhir ->
// konsistensi upload 22/26 minggu (84,6%). Tanggal eksplisit, bukan dihitung,
// supaya mudah diaudit; minggu kosong menutup 4 minggu sisa periode.
const recentUploadDates = [
  '2026-10-06', '2026-09-28', '2026-09-21', '2026-09-14', '2026-09-07', '2026-09-01',
  '2026-08-24', '2026-08-17', '2026-08-10', '2026-08-03', '2026-07-27', '2026-07-20',
  '2026-07-13', '2026-07-06', '2026-06-29', '2026-06-22', '2026-06-10', '2026-06-01',
  '2026-05-25', '2026-05-18', '2026-05-06', '2026-04-27',
]

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

// PRNG deterministik: hasil id sama setiap kali dijalankan.
const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
function id11(rand) {
  let out = ''
  for (let i = 0; i < 11; i++) out += B62[Math.floor(rand() * B62.length)]
  return out
}

// ponytail: hanya 100 video terbaru yang dihasilkan; pageInfo.totalResults
// tetap 1104 (angka channel asli) dan permintaan setelah offset 100 balas
// kosong. Bureau hanya butuh sekitar dua halaman.
const EXPOSED = 100
// Gap pertama besar: video "older" pertama harus jatuh SEBELUM awal jendela
// 26 minggu (sejak 11 Apr 2026) agar hitungan engine pas 22 upload per 26 minggu.
const OLDER_GAPS = [18, 4, 3, 5, 4, 6, 3]
const OLDEST_RECENT = new Date('2026-04-27T00:00:00Z')

function olderDate(k) {
  let days = 0
  for (let j = 0; j <= k; j++) days += OLDER_GAPS[j % OLDER_GAPS.length]
  const d = new Date(OLDEST_RECENT)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

const ITEMS = Array.from({ length: EXPOSED }, (_, i) => {
  const rand = seeded(1234 + i * 7919)
  const date = i < recentUploadDates.length ? recentUploadDates[i] : olderDate(i - recentUploadDates.length)
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

module.exports = {
  CHANNEL_ID,
  UPLOADS_PLAYLIST_ID,
  channel,
  monthly,
  /** 100 item terbaru playlist uploads, urut terbaru dulu. */
  playlistItems: ITEMS,
  /** totalResults asli playlist (angka channel), bukan jumlah yang dihasilkan. */
  totalResults: 1104,
}
