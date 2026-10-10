# Mock AdSense Payments page

Halaman statis bergaya AdSense "Info pembayaran" — **target verifikasi zkTLS
(zkPass TransGate)**. TransGate melakukan 3P-TLS ke domain ini, jadi proof
tetap kriptografis asli; domain-nya saja milik kita. Deploy sebagai **project
Vercel kedua** (domain terpisah dari cashy-web agar terlihat seperti situs
pihak ketiga).

## Kontrak zkPass schema (jangan diubah tanpa update schema)

TransGate menyadap request API, bukan HTML — jadi kontrak stabilnya adalah
**nama key di JSON**, bukan selector HTML:

- **Target intercept**: `GET /data/payments.json` (diload halaman via `fetch`,
  terlihat sebagai XHR di tab Network — persis cara TransGate menangkapnya).
- `payment_id` → **nullifier** (anti didanai-ganda; di mock ini satu akun
  demo, jadi semua proof berbagi nilai yang sama — cukup untuk demo).
- `balance_final` → saldo final yang diverifikasi (angka polos, tanpa format).
- `currency` → `IDRX`.
- Key lain (`creator_id`, `period`, `payout_window`, `estimate_next`,
  `generated_at`) bebas, tapi jangan dihapus.

Halaman HTML mem-fetch JSON saat load; angka statis di HTML hanyalah fallback
offline dan harus dibuat identik dengan JSON.

## Schema JSON untuk zkPass Dev Center

```json
{
  "issuer": "AdSense",
  "desc": "Saldo akhir AdSense yang sudah final dan siap dibayar",
  "website": "https://<URL-MOCK>/",
  "APIs": [
    {
      "host": "<HOST-MOCK>",
      "intercept": { "url": "data/payments.json", "method": "GET" },
      "assert": [
        { "key": "currency", "value": "IDRX", "operation": "=" },
        { "key": "balance_final", "value": "0", "operation": ">=" }
      ],
      "nullifier": "payment_id"
    }
  ],
  "tips": { "message": "Halaman pembayaran terbuka. Klik 'Mulai' untuk memverifikasi saldo." }
}
```

Ganti `<URL-MOCK>` / `<HOST-MOCK>` dengan URL produksi Vercel. Alur setup:
schema divalidasi di Dev Center (gratis) dengan ekstensi Schema Validator →
deploy → catat `appId` + `schemaId` → `TransgateConnect(appid).launch(schemaId,
walletAddress)` di sisi cashq-web.

## Deploy (project Vercel kedua)

1. Push repo, lalu di dashboard Vercel: **Add New… → Project → Import**.
2. Sebelum menekan Deploy, buka **Root Directory** → set `mock-adsense`.
3. Framework Preset: **Other** (static, tanpa build command, tanpa output dir).
4. Deploy → catat URL produksi.
5. Isi URL itu ke env cashq-web (mis. `MOCK_ADSENSE_URL`) dan ke schema di atas.

## Testing lokal

`fetch()` butuh server HTTP (via `file://` ia gagal — halaman tetap tampil
pakai angka fallback statis):

```sh
python -m http.server 8080
# lalu buka http://localhost:8080
```

Cek tab Network: `data/payments.json` harus muncul sebagai XHR dengan
`Content-Type: application/json`.

## Mock YouTube API (bureau)

Folder `api/` adalah serverless functions Vercel yang meniru **YouTube
Analytics API v2** dan **YouTube Data API v3** — sumber data bureau system
CashQ (server-to-server, bukan bagian bukti zkTLS). Logika ada di `lib/`;
dataset (channel, tren bulanan, ritme upload) ada di `lib/bureau-data.js`.

| Endpoint | Meniru |
|---|---|
| `GET /api/youtube/v2/reports` | Analytics API `reports.query` |
| `GET /api/youtube/v3/channels` | Data API `channels.list` |
| `GET /api/youtube/v3/playlistItems` | Data API `playlistItems.list` |

Semua endpoint: header `Authorization: Bearer <apa pun>` wajib (tanpa itu
401 error envelope Google), CORS terbuka `*`, query param asli dihormati
(`metrics`, `dimensions`, `startDate`, `endDate`, `sort`, `part`, `mine`,
`maxResults`, `pageToken`). Catatan perilaku sesuai docs asli:

- `reports`: `dimensions=month` hanya menerima bulan, dan **kedua tanggal
  wajib tanggal 1**; metrik didukung: `views`, `estimatedRevenue`;
  `currency`/`filters` diterima lalu diabaikan.
- `playlistItems`: `maxResults` default 5, maks 50; paginasi via
  `nextPageToken` (maksimal 100 item terbaru yang dihasilkan,
  `pageInfo.totalResults` tetap 1104).
- Angka Sep 2026 = **8.400.000**, persis `balance_final` di
  `data/payments.json`, supaya tren bureau dan bukti zkTLS bercerita sama.

Contoh:

```sh
curl -H "Authorization: Bearer demo" \
  "https://cashy-web-mock-adsense.vercel.app/api/youtube/v2/reports?ids=channel==MINE&startDate=2026-04-01&endDate=2026-09-01&metrics=views,estimatedRevenue&dimensions=month"
```

Test logika tanpa deploy: `node lib/selftest.js` (24 assert). Menjalankan
functions secara lokal butuh `vercel dev` (folder `api/` tidak jalan di
`python -m http.server`); dev loop cashq-webapp bisa langsung fetch URL
produksi karena CORS terbuka.

File statis lama (`index.html`, `styles.css`, `data/payments.json`) TIDAK
terkait endpoint ini dan jangan diubah — kontrak zkPass di atas bergantung
padanya.
