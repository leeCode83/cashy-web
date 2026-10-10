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
