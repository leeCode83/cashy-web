# Cashy: zkTLS Verification Brief

Status: approved untuk implementasi. Sumber: diskusi keputusan Reclaim Protocol + mock AdSense page (2026-10-09), temuan eksplorasi `src/pages/creator/cashout/Verify.tsx` dan `src/mock/api.ts`. Brief ini panduan develop mekanisme verifikasi zkTLS oleh AI lain.

## 1. Apa

Verifikasi saldo final AdSense via zkTLS nyata (Reclaim Protocol) untuk skala hackathon. Scope: **hanya halaman Payments AdSense** yang menunjukkan saldo yang akan cair tanggal 21–26 — **tanpa histori 12 bulan** (didefer). Output: saldo terverifikasi yang dipakai langkah Amount, menggantikan angka hardcoded dari `verifyAdSense` di `src/mock/api.ts`.

Mock AdSense page (dibuat dan dideploy kita) menjadi target verifikasi. Proof tetap kriptografis asli: Reclaim meng-attest sesi HTTPS ke domain mock page — bukti berasal dari server asli dengan TLS valid, hanya saja domain-nya milik kita.

## 2. Keputusan arsitektur

- **Semua dalam repo webapp ini** — frontend dan backend kecil (`api/` folder, otomatis Vercel serverless functions meski frontend static). Alasan: backend cuma dua endpoint kecil, satu deploy/satu env, deadline hackathon Oct 9–10, dan Verify.tsx + endpoint berubah bareng (schema proof). Pisah service jadi bener jika nanti scoring Bureau harus server-side lintas lender atau butuh database replay-protection sungguhan (lihat `docs/cashy-bureau-system-brief.md` §6).
- **Mock AdSense page** jadi subfolder `mock-adsense/` di repo ini, dideploy sebagai **project Vercel kedua** (domain terpisah agar proof meng-attest domain yang terlihat seperti situs pihak ketiga, bukan cashy-web).
- **Stack zkTLS: Reclaim Protocol** (menggantikan TLSNotary yang tertulis di `docs/42-cashy.md` — docs akan diupdate). Alasan: managed attestor, JS SDK resmi, docs hackathon lengkap, tercepat jalan.

## 3. Flow end-to-end

```
[1] Verify.tsx klik "Verify" (jalur adsense)
        ↓
[2] POST /api/reclaim-request
    Server: ReclaimProofRequest.init(RECLAIM_APP_ID, RECLAIM_APP_SECRET, providerId)
    → setAppCallbackUrl → toJsonString()
    Respons: config JSON (tanpa secret)
        ↓
[3] Frontend src/lib/zktls.ts
    startSession({ onSuccess, onError }) — verifikasi via
    Reclaim portal / browser extension di tab baru
        ↓
[4] Kreator login ke mock AdSense page → Reclaim menyegel sesi,
    proof dibuat oleh attestor Reclaim
        ↓
[5] Proof balik ke frontend (onSuccess) ATAU otomatis ke
    /api/reclaim-verify (callback URL)
        ↓
[6] POST /api/reclaim-verify: verifyProof(proof) → extract
    extractedParameters.balance → { verified, finalBalanceCents }
        ↓
[7] Frontend simpan verifiedBalanceCents + balanceSource ke AppState
    → navigate /creator/cash-out/amount
```

## 4. Komponen yang dibangun (per file)

| File | Isi |
|---|---|
| `mock-adsense/index.html` (+ css) | Static page bergaya dashboard AdSense Payments: saldo final 8.400.000 IDRX, jadwal payout 21–26. Struktur HTML **stabil**, elemen saldo diberi `data-testid="final-balance"` — regex provider menarget elemen ini. Deploy: project Vercel kedua. |
| Reclaim dashboard (konfigurasi, bukan kode) | Custom provider: URL = URL mock page ter-deploy; `responseMatches`: regex menangkap angka saldo dari elemen balance → parameter `balance`. Catat `providerId` di env. |
| `api/reclaim-request.ts` | Endpoint Vercel function. `ReclaimProofRequest.init(APP_ID, APP_SECRET, providerId)` dari env, `setAppCallbackUrl(<origin>/api/reclaim-verify)`, kembalikan `reclaimProofRequest.toJsonString()`. |
| `api/reclaim-verify.ts` | Terima proof (URL-encoded dari callback, atau JSON POST dari frontend), `verifyProof()` dari `@reclaimprotocol/js-sdk`, extract `data[0].extractedParameters.balance`, konversi ke cents, respons `{ verified, finalBalanceCents }`. Tolak proof duplikat per `sessionId` (replay protection minimal — in-memory cukup untuk hackathon). |
| `src/lib/zktls.ts` | Fungsi murni-ish: `POST /api/reclaim-request` → `ReclaimProofRequest.fromJsonString(config)` → `startSession` → kirim proof ke `/api/reclaim-verify` → balikin `{ finalBalanceCents }`. Error dilempar sebagai tipe terdefinisi. |
| `src/pages/creator/cashout/Verify.tsx` | Tukar sumber angka: `verifyAdSense` (mock) → `verifyAdSenseZk` (zktls.ts). Tambah phase `'error'` (sekarang belum ada) untuk kegagalan extension/proof. State machine existing (`waiting → sealing → slow → verified/cancelled`) dipertahankan. |
| `src/state/AppStateContext.ts` | Tambah `verifiedBalanceCents: number \| null` dan `balanceSource: 'zktls' \| 'mock' \| null` + setter. Amount/Review/Dashboard pakai nilai terverifikasi, fallback ke `creator.finalBalanceCents` dari mock data. |
| `src/mock/api.ts` | Jalur mock (`verifyAdSense`) **tetap ada** — dipakai fallback `?demo=mock`. |

## 5. API kontrak

### `POST /api/reclaim-request`

Respons sukses:
```json
{ "config": "<string hasil ReclaimProofRequest.toJsonString()>" }
```

Respons error (semua endpoint, shape sama):
```json
{ "error": "<kode singkat: 'env_missing' | 'reclaim_init_failed'>" }
```
Status HTTP sesuai: 500 untuk env/kegagalan internal, 400 untuk payload rusak.

### `POST /api/reclaim-verify`

Body (dua bentuk diterima):
- Callback Reclaim: body URL-encoded (`decodeURIComponent` lalu `JSON.parse`) — set `Content-Type: text/plain`.
- Frontend: `{ "proof": <objek proof atau array proof>, "sessionId": "<string>" }`.

Respons sukses:
```json
{ "verified": true, "finalBalanceCents": 840000000 }
```

Respons gagal verifikasi: `{ "verified": false, "error": "proof_invalid" }` (HTTP 200 — kegagalan verifikasi bukan error transport).
Replay (sessionId sudah dipakai): `{ "error": "session_replayed" }` (HTTP 409).

Konvensi: cents = integer (lihat `src/lib/money.ts`). Parser proof + konversi `balance` → cents dipisah jadi fungsi murni agar bisa dites tanpa network.

## 6. Env / secret

| Variabel | Dipakai di | Sifat |
|---|---|---|
| `RECLAIM_APP_ID` | `api/*` | public boleh, tapi taruh server |
| `RECLAIM_APP_SECRET` | `api/*` | **RAHASIA — jangan pernah sampai ke browser** |
| `RECLAIM_PROVIDER_ID` | `api/*` | id custom provider di Reclaim dashboard |
| `MOCK_ADSENSE_URL` | `api/*` | URL mock page ter-deploy |

Diisi via Vercel env settings, bukan `.env` yang di-commit. Dev lokal: `.env.local` (sudah di gitignore).

## 7. Constraints kode

- TypeScript strict: `erasableSyntaxOnly` (tanpa enum/namespace/parameter property), `verbatimModuleSyntax`, import **ber-ekstensi** `.ts`/`.tsx` (`allowImportingTsExtensions`).
- React 19 + React Compiler — hindari pattern yang compiler tidak dukung (mutasi state, refs sembarangan).
- CSS: class-based plain CSS di `src/styles/`, tanpa Tailwind/CSS-in-JS. Komponen ada di `src/components/` (mis. `StatusCard`).
- Routing: `react-router` (bukan `react-router-dom`).
- Tes: tanpa framework — `node --experimental-strip-types`, helper `check(label, actual, expected)` seperti `src/lib/money.test.ts`. Tes wajib: extractor saldo dari `extractedParameters` (berbagai format angka), konversi ke cents, pemetaan `balanceSource`.
- Konvensi repo: SRP/DRY/KISS, JSDoc singkat, **typecheck + lint + test sebelum tiap commit**, commit inkremental per komponen.

## 8. Fallback demo & risiko

- **Fallback `?demo=mock`**: jalur prerecorded lama (`verifyAdSense` di `src/mock/api.ts`) tetap hidup dan jadi default bila flag ada — demo tetap jalan saat extension tidak terpasang / internet bermasalah di meja juri.
- Risiko yang harus diantisipasi:
  - Extension Reclaim tidak terpasang → cek `isExtensionInstalled` lebih dulu, tawarkan mode portal (tab baru), baru tawarkan fallback.
  - Anti-bot / CSP di domain mock (Vercel umumnya aman).
  - Rate limit / latency attestor Reclaim → phase `'slow'` yang sudah ada menutup ini.
  - Angka mock page dan regex provider harus sinkron — regex diuji dulu di dashboard Reclaim sebelum demo.

## 9. Defer (jangan dikerjakan)

- Histori pendapatan 12 bulan (input penuh Bureau System) — bureau sementara tetap baca mock data.
- Verifikasi ke AdSense Google asli.
- Nullifier anti didanai-dua-kali onchain, pool 3 lapis.
- Database replay-protection permanen (in-memory per-instance cukup untuk hackathon).
