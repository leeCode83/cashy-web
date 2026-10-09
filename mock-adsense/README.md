# Mock AdSense Payments page

Halaman statis bergaya AdSense "Payments" — **target verifikasi zkTLS**.
Reclaim meng-attest sesi HTTPS ke domain ini, jadi proof tetap kriptografis
asli; domain-nya saja milik kita. Deploy sebagai **project Vercel kedua**
(domain terpisah dari cashy-web agar terlihat seperti situs pihak ketiga).

Kontrak stabil dengan regex provider:

- Saldo final ada di satu elemen flat: `data-testid="final-balance"` → `8.400.000 IDRX`
- Jendela payout: `data-testid="payout-window"` → `21 – 26 Oktober 2026`
- Jangan minify / ubah struktur markup tanpa mengupdate regex (lihat bawah).

## Deploy (project Vercel kedua)

1. Push branch ini, lalu di dashboard Vercel: **Add New… → Project → Import** repo `cashy-web`.
2. Sebelum menekan Deploy, buka **Root Directory** → set `mock-adsense`.
3. Framework Preset: **Other** (static, tanpa build command, tanpa output dir).
4. Deploy → catat URL produksi (mis. `https://adsense-mock-xxx.vercel.app`).
5. Isi URL itu ke `MOCK_ADSENSE_URL` (`.env.local` + Vercel env cashy-web).

## Konfigurasi provider Reclaim (dashboard, bukan kode)

Custom provider di [Reclaim dashboard](https://dev.reclaimprotocol.org):

- **URL**: URL mock page ter-deploy (langkah 4).
- **Response Matches** — regex mengekstrak saldo ke parameter `balance`:

  ```
  data-testid="final-balance">\s*(?<balance>[\d.,]+)
  ```

- **Uji regex di preview dashboard sebelum dipakai demo** — regex harus
  menangkap `8.400.000` (bukan `8`, bukan baris lain).
- Salinan angka di tabel "Ringkasan transaksi" sengaja identik; bila regex
  menangkap keduanya, persempit dengan konteks (anchor `data-testid` sudah
  unik di halaman ini).
- Catat **Provider ID** dari provider yang jadi → `RECLAIM_PROVIDER_ID`.

## Testing lokal

Buka `index.html` langsung di browser — tidak butuh build.
