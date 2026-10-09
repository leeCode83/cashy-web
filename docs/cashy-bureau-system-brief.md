# Cashy: Bureau System Brief

Status: draft. Sumber: `docs/42-cashy.md`, diskusi keputusan rule-based. Implementasi: satu modul murni di repo webapp ini, `src/lib/bureau.ts`.

## 1. Apa

Penilai rule-based yang menentukan berapa persen saldo final AdSense yang boleh dicairkan. Ia satu fungsi murni: histori masuk, rasio keluar — angka sama selalu hasil sama. Bukan AI: tanpa pelatihan, tanpa kotak hitam, bisa dites dan dijelaskan.

## 2. Flow

1. Kreator selesai Verify — saldo final + histori 12 bulan sudah tersimpan.
2. Bureau menghitung 6 sifat channel dari histori itu.
3. Hasilnya rasio batas (misal 70%), lalu `limit = saldo final × rasio`.
4. Limit tampil di langkah Amount dengan tombol "Why this limit?" yang membuka penjelasan per sifat.

## 3. Data dibutuhkan + sumber

| Data | Sumber | Catatan |
|---|---|---|
| Pendapatan bulanan 12 bulan | Utama: sesi zkTLS AdSense. Cadangan: YouTube Analytics API (`yt-analytics-monetary.readonly`) | Metode cadangan menghasilkan rasio lebih kecil (mock: 40%) karena datanya estimasi |
| Jadwal upload | Analytics API / data channel | Untuk konsistensi upload |
| Topik channel | Klasifikasi manual/statik | Tabel topik → faktor decay niche |

## 4. Enam sifat yang dihitung

| Sifat | Cara hitung |
|---|---|
| Volatilitas | Standar deviasi pendapatan bulanan |
| Tren arah | Kemiringan regresi linear 12 bulan |
| Konsistensi upload | Rata-rata jeda antar video |
| Anomali traffic | Lonjakan view di luar pola (outlier) |
| Sinyal kesehatan | Perbandingan pendapatan antar bulan |
| Decay niche | Tabel topik → faktor (diisi manual) |

Tiap sifat dinormalisasi jadi nilai 0–1, lalu rata tertimbang menghasilkan rasio batas. Rentang rasio: 0.40–0.70 (AdSense), maksimum 0.40 (metode cadangan).

## 5. Output

Objek `{ ratio, limit, breakdown }`:

- `ratio` — angka 0–1 (misal `0.7`).
- `limit` — batas cair dalam sen (integer), dikonversi IDRX oleh `formatIDRX`.
- `breakdown` — nilai per sifat plus teks bahasa awam, dipakai popover "Why this limit?" dan bahan transparansi untuk juri.

## 6. Implementasi

- Satu modul `src/lib/bureau.ts`, fungsi murni tanpa state, tanpa service terpisah.
- Tes kecil `bureau.test.ts`: input sama → rasio sama (pola `money.test.ts`).
- Berpindah ke service hanya jika nanti scoring harus server-side lintas lender — rumusnya tetap sama, tinggal pindah file.
