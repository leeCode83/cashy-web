# Cashy: UI/UX Design Brief

Status: draft untuk review. Sumber: `docs/42-cashy.md`, hasil interview, skill `apple-design` (Apple HIG), `web-design-guidelines` (Vercel), `design-taste-frontend`, `minimalist-ui`, `high-end-visual-design`.
Aliran uang (advance, deposit LP, pelunasan) berjalan onchain dengan IDRX stablecoin. Verifikasi AdSense dan payout Google disimulasikan: payout tiba sebagai IDRX ke payout account kreator saat tanggal 21 (waktu demo di-warp), lalu pelunasan ditarik dari akun itu lewat kontrak. Rel fiat autodebet bank adalah integrasi partner berlisensi BI di produksi dan dinyatakan sebagai itu di demo — bukan di-mock sebagai bank. Yang dinilai adalah flow dan UX.

## 1. Intent

| | |
|---|---|
| Outcome | Web app Cashy yang menunjukkan alur advance dari awal sampai uang masuk, dan alur LP mengisi vault. |
| Penonton utama | Juri/penonton demo di laptop atau PC. Mobile harus tetap rapi. |
| Persona | Kreator (login Google, tanpa istilah crypto; "Connect Payout Account" adalah satu tap yang di balik layar menandatangani approval wallet). LP (connect wallet). |
| Sukses | Kreator selesai cash-out dalam 4 langkah dan paham biaya sebelum menekan tombol. LP paham risiko tiap lapis sebelum deposit. Setiap kejadian (sukses, error, menunggu) dijelaskan dengan bahasa yang jelas. |
| Constraint | UI berbahasa Inggris. Nominal dalam IDRX stablecoin dengan 2 angka di belakang koma. Desktop-first, responsif. Stack: Vite + React 19. |
| Out of scope | Mock YouTube Studio, "lender nakal", withdraw LP, dark mode, advance prediktif (jendela 21–3), zkTLS asli (diprarekam), rel fiat autodebet bank via open finance (dinyatakan sebagai integrasi produksi), notification center (bell). |

## 2. Prinsip desain

Dipilih dari 8 prinsip Apple (`design-principles.md`) dan diterjemahkan ke Cashy.

1. **Purpose.** Satu layar, satu tugas. Cash-out hanya soal: berapa, berapa biayanya, kapan kembali.
2. **Responsibility.** Fee dan tanggal pelunasan selalu terlihat sebelum komitmen. Risiko LP tidak disembunyikan.
3. **Agency.** Tiap langkah cash-out bisa kembali tanpa kehilangan input. Tidak ada jalan buntu setelah error.
4. **Familiarity.** Stepper, tab bar, form, dan sheet memakai pola standar. Identitas ada di warna, tipe, dan satu elemen signature.
5. **Simplicity.** Bureau AI tidak punya layar sendiri. Ia muncul sebagai satu batas dengan tombol "Why this limit?".
6. **Craft.** Angka rata (tabular), copy singkat, semua state (loading, kosong, error) didesain.
7. **Delight, bukan dekorasi.** Satu momen gerak: uang meluncur di payday rail saat berhasil.

## 3. Arsitektur informasi dan route

Satu app, satu brand, dua pintu. Tidak ada toggle peran di nav. Pindah peran lewat menu akun.

| Route | Layar | Peran |
|---|---|---|
| `/` | Landing | Publik |
| `/creator` | Dashboard | Kreator |
| `/creator/cash-out/verify` | Langkah 1: Verify | Kreator |
| `/creator/cash-out/amount` | Langkah 2: Amount | Kreator |
| `/creator/cash-out/review` | Langkah 3: Review | Kreator |
| `/creator/cash-out/done` | Langkah 4: Done | Kreator |
| `/creator/history` | History | Kreator |
| `/lp` | Vault | LP |
| `/lp/position` | My position | LP |

Navigasi:
- Desktop: top bar satu mode. Kreator: Dashboard, Cash Out, History. LP: Vault, My Position. Menu akun di kanan.
- Mobile (<640 px): bottom tab bar dengan label teks di bawah ikon. Kreator 3 tab, LP 2 tab. Tab hanya untuk navigasi, bukan aksi (`tab-bars.md › Best practices`).
- Lokasi saat ini selalu terlihat (tab/link aktif, dan stepper di cash-out).
- Tiap langkah cash-out punya URL sendiri. State input disimpan di memori app agar tombol Back tidak menghapusnya.

## 4. Identitas visual

Arah: energik, netral platform. Bahasa visual "creator economy", bukan YouTube. Tanpa merah-putih YouTube, tanpa ikon play. YouTube dan AdSense hanya muncul di langkah Verify sebagai sumber data.

### 4.1 Warna

Satu aksen. Warna lain hanya untuk status. Rasio dihitung dari hex (perkiraan, verifikasi ulang saat implementasi).

| Token | Hex | Peran | Kontras |
|---|---|---|---|
| `--canvas` | `#FFFFFF` | Latar halaman | |
| `--surface` | `#F4F5F7` | Kartu, area sekunder | |
| `--ink` | `#0E1116` | Teks utama | 18.9:1 di putih |
| `--ink-muted` | `#475467` | Teks sekunder | sekitar 7:1 di putih |
| `--line` | `#E4E7EC` | Garis pembatas | |
| `--accent` | `#FF5A1F` | CTA utama, rail, momen kunci | Teks ink di atas accent: 6.1:1. Accent sebagai teks di putih hanya 3.1:1, jadi tidak dipakai untuk teks. |
| `--ok` / `--ok-bg` | `#067647` / `#ECFDF3` | Sukses, uang masuk | 5.7:1 di putih |
| `--error` / `--error-bg` | `#B42318` / `#FEF3F2` | Gagal | 6.6:1 di putih |
| `--wait` / `--wait-bg` | `#93370D` / `#FFFAEB` | Menunggu, peringatan | 7.5:1 di putih |
| `--info` / `--info-bg` | `#175CD3` / `#EFF8FF` | Informasi | 6.0:1 di putih |

Aturan:
- Warna tidak pernah jadi satu-satunya pembawa makna. Status selalu punya ikon dan label teks (`accessibility.md`, `color.md`).
- Aksen dipakai hemat: satu CTA utama per layar, rail, dan penanda. Bukan untuk dekorasi besar.
- Latar putih dan abu dingin dipilih sengaja agar tidak jatuh ke palet krem-cokelat yang sudah umum di desain hasil generator.

### 4.2 Tipografi

| Peran | Font | Catatan |
|---|---|---|
| Display (headline landing, angka besar) | Bricolage Grotesque | Dipakai hemat |
| UI dan body | Geist | Minimum 16 px di mobile, body 16–17 px |
| Angka IDRX, tanggal, hash | Geist Mono | `font-variant-numeric: tabular-nums` |

Skala (px): 12 / 14 / 16 / 20 / 28 / 40 / 56. Headline landing maksimal 2 baris di desktop. `text-wrap: balance` di heading. Self-host font dengan `font-display: swap`.

### 4.3 Bentuk dan permukaan

- Radius: kontrol 10 px, kartu 16 px, chip pil penuh. Tidak diubah di tengah jalan.
- Kartu hanya bila membedakan hierarki. Selain itu pakai garis tipis dan ruang kosong.
- Bayangan: hampir tidak ada, tipis dan tinted. Tanpa blur kaca di konten.
- Ikon: satu keluarga (Phosphor, bobot regular), stroke konsisten. Tidak ada emoji. Ikon dekoratif `aria-hidden`.

### 4.4 Signature: Payday Rail

Garis horizontal dari "Today" ke "The 21st". Penanda uang berada di ujung kiri saat uang maju cair, dan tanggal pelunasan di kanan. Ini ringkasan visual produk: uang maju, tanggal tetap terlihat.

- Dashboard: rail menunjukkan posisi saat ini, tanggal Google posting saldo, dan tanggal payout.
- Review: rail menunjukkan "You get X today" (kiri) dan "Repaid on the 21st" (kanan).
- Done: penanda meluncur dari kanan ke kiri sekali, lalu diam. Hanya `transform`/`opacity`. Dengan `prefers-reduced-motion`, rail langsung tampil di posisi akhir.
- Mobile: rail tetap horizontal dengan 3 titik (Today, Posted, Payout), label di bawah titik. Tidak scroll horizontal.

## 5. Format nominal dan angka

- Satuan: `IDRX`. Dua angka di belakang koma, pemisah ribuan koma, titik desimal: `12,500,000.00 IDRX`.
- Implementasi: `Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` lalu ` IDRX`. Tidak ada format hardcode.
- Simpan nilai sebagai integer satuan sen (1/100 IDRX) agar tidak ada error float. Fee dibulatkan half-up ke 2 desimal, lalu `repay = principal + fee` persis, sehingga angka di layar selalu cocok.
- Persen: satu desimal bila perlu (`2.5%`).
- Tanggal: `Intl.DateTimeFormat('en-US')`, contoh `Oct 21`. Teks "the 21st" dipakai di copy karena payout Google bertanggal tetap.
- Nama brand dan token diberi `translate="no"`.

Contoh mock yang dipakai konsisten di semua layar:

| Item | Nilai |
|---|---|
| Final balance (siap cair) | `8,400,000.00 IDRX` |
| Batas cair dari bureau (70%) | `5,880,000.00 IDRX` |
| Contoh jumlah diambil | `5,000,000.00 IDRX` |
| Fee flat 2.5% | `125,000.00 IDRX` |
| Dipotong tanggal 21 | `5,125,000.00 IDRX` |
| Sisa payout untuk kreator | `3,275,000.00 IDRX` |
| Minimum cash-out (mock) | `100,000.00 IDRX` |

## 6. Spesifikasi layar

### 6.1 Landing `/`

Tujuan: dalam 5 detik, orang paham "uang cair hari ini, bayar otomatis tanggal 21, fee jelas".

```
[ Cashy ]                         How it works   Vault        [ Get Cash Early ]
------------------------------------------------------------------------------
  Get paid before payday.                 |  Payday rail (live demo, mock)
  Cash out part of your final AdSense     |  Today -----o------------- The 21st
  balance today. One flat fee, no         |  You get 5,000,000.00 IDRX
  interest, repaid automatically on the   |  Fee 125,000.00 IDRX
  21st.                                   |
  [ Get Cash Early ]  [ Earn From The Vault ]
------------------------------------------------------------------------------
  How it works: 4 langkah (Verify, Choose, Review, Done), satu baris, bukan 3 kartu sama besar
  Why not a payday loan: tabel perbandingan 0.3% per hari vs flat 2.5%
  Why onchain: satu kalimat, satu tautan. Bukan bagian hero.
```

- Hero: headline 2 baris, subtext 19 kata, dua CTA. CTA utama jeruk, CTA LP sekunder (outline). Tidak ada logo wall, statistik, atau tagline kecil di hero.
- Posisi: split asimetris, teks kiri, rail interaktif kanan. Rail memakai angka mock yang bisa digeser.
- Satu eyebrow paling banyak untuk 3 section. Tidak ada label "Section 01".
- Mobile: satu kolom, CTA utama penuh lebar, rail di bawah headline.

### 6.2 Dashboard kreator `/creator`

Satu tugas: tahu saldo yang bisa dicairkan dan langsung mulai.

```
Good morning, Dewi                                   [Account]
------------------------------------------------------------------
 Ready to cash out                       Payday rail
 8,400,000.00 IDRX final balance         Today --o------- Oct 3 ------- Oct 21
 You can take up to 5,880,000.00 IDRX
 [ Cash Out ]    Why this limit?
------------------------------------------------------------------
 Active advance (jika ada)                   Credit record
 5,000,000.00 IDRX, repays on Oct 21         3 on-time repayments
 Status: Active                              Verified onchain ↗
------------------------------------------------------------------
 Recent activity (5 baris terakhir, "View All")
```

- Kartu utama: angka besar (display, mono), CTA jeruk tunggal.
- Tiga state: **Belum verifikasi** (CTA "Verify AdSense"), **Siap cair** (di atas), **Advance aktif** (CTA diganti detail advance, cash-out baru dinonaktifkan dengan alasan tertulis).
- "Why this limit?" membuka popover singkat: batas dari riwayat 12 bulan, 6 sifat channel dalam bahasa awam. Bukan skor mentah.
- "Verified onchain" adalah satu baris kecil dengan tautan ke explorer. Tidak ada wallet atau istilah crypto lain.
- Loading: skeleton sesuai bentuk. Kosong: ajakan ke aksi berikutnya.

### 6.3 Cash-out (4 langkah)

Stepper di atas: `Verify · Amount · Review · Done`, langkah aktif ditandai ikon, bukan hanya warna. Tiap langkah punya satu tugas dan satu tombol utama. Tombol Back selalu ada kecuali di Done.

**Langkah 1: Verify**
- Isi: penjelasan 2 baris ("Sign in to AdSense. We seal your session so only the result is shared, never your password or full figures."), tombol "Connect AdSense".
- Status berurutan: Waiting for sign-in → Sealing your session → Balance verified.
- Hasil: kartu "Final balance 8,400,000.00 IDRX, payable on the 21st", tombol "Continue".
- Cadangan: tautan teks "Connect YouTube Analytics instead" dengan catatan "Lower limit with this method" (angka batas mock).
- Privasi: tulis jelas apa yang dibagikan dan apa yang tidak (Responsibility, `privacy.md`).

**Langkah 2: Amount**
- Input angka besar (mono, tabular), slider 0–batas, chip cepat (25% / 50% / Max).
- Batas bureau tampil di bawah input: "Up to 5,880,000.00 IDRX". Tombol "Why this limit?".
- Ringkasan live di samping (desktop) atau di bawah (mobile): You get today, Fee 2.5%, Repaid on the 21st.
- Validasi dinamis, inline, di bawah field. `inputmode="decimal"`, `autocomplete="off"`, paste tidak diblokir.

**Langkah 3: Review**
- Dua kolom di desktop: kiri ringkasan angka dan rail, kanan bind payout account dan persetujuan.
- Ringkasan: You get today `5,000,000.00 IDRX` · Fee `125,000.00 IDRX` (flat, no interest) · Repaid on Oct 21 `5,125,000.00 IDRX` · You keep `3,275,000.00 IDRX` dari payout.
- Bind payout account: tombol "Connect Payout Account". Status: Waiting for you to approve → Account linked. Satu tap; di baliknya tanda tangan wallet yang menyetujui penarikan pelunasan — istilah crypto tidak muncul di UI. Di produksi, langkah ini menjadi bind rekening via open finance berlisensi BI.
- Centang: "I allow Cashy to collect repayment from this account on Oct 21, when my payout arrives."
- Tombol "Cash Out Now" nonaktif sampai akun terhubung dan centang dicentang. Alasan nonaktif ditulis di bawah tombol (bukan tooltip saja).

**Langkah 4: Done**
- Judul "Money's on its way" lalu berubah ke "Money received" saat dana masuk (mock: setelah 2–3 detik).
- Momen gerak: penanda meluncur di rail.
- Timeline: Today (received) → Oct 21 (auto-repay) → Credit record updated.
- Aksi: "Back To Dashboard", "View Receipt". Tanpa konfeti.

### 6.4 Vault LP `/lp`

```
Vault                                              [ Connect Wallet ]
---------------------------------------------------------------------
 Total deposited 120,000,000.00 IDRX  |  Active advances  |  Repaid on time 98.4%
---------------------------------------------------------------------
 [ Senior ]            [ Junior ]            [ Reserve ]            | Deposit panel
 Est. yield 9.0%       Est. yield 18.0%      Est. yield 4.0%        | Selected: Senior
 Risk: Lowest          Risk: Highest         Risk: Low              | Amount [______] IDRX
 Takes losses 3rd      Takes losses 1st      Takes losses 2nd       | Balance 25,000,000.00
 Capacity left         Capacity left         Capacity left          | You'll receive ...
 40,000,000.00         10,000,000.00         15,000,000.00          | [ Deposit ]
---------------------------------------------------------------------
 How the waterfall works (satu diagram kecil, bukan paragraf)
 Live feed: nullifier terbaru, advance terbaru (alamat dan tx hash)
```

- Angka yield dan kapasitas adalah mock.
- Tiga kartu lapis berdampingan. Default terpilih: Senior. Junior tidak pernah terpilih otomatis dan diberi peringatan risiko eksplisit yang harus dikonfirmasi (checkbox) sebelum deposit.
- Panel deposit: di desktop sticky di kanan. Di mobile jadi bottom sheet dengan CTA tetap di bawah, grabber, dan cara menutup selain tombol (`sheets.md`).
- Sisi LP boleh lebih padat dan teknis: alamat, tx hash (Geist Mono, tombol salin), tautan explorer.
- Feed "Latest nullifiers" menunjukkan bukti anti-didanai-ganda bagi juri, dalam bahasa singkat: "Payout #A1F3 claimed. Can't be funded again."

### 6.5 My Position `/lp/position`

Daftar posisi per lapis: jumlah, yield berjalan, status. Kosong: ajakan ke Vault. Ringkas, tanpa withdraw (out of scope).

### 6.6 History `/creator/history`

Tabel di desktop, daftar kartu di mobile. Kolom: tanggal, aktivitas, jumlah, status (chip). Baris bisa dibuka untuk detail. Kosong: "No activity yet. Your first cash-out will appear here."

## 7. Sistem umpan balik, notifikasi, dan pesan

Tujuan: pengguna selalu tahu apa yang terjadi, apa dampaknya pada uang mereka, dan apa yang bisa dilakukan sekarang.

### 7.1 Lima jenis status

| Jenis | Arti | Ikon | Warna | Kapan |
|---|---|---|---|---|
| Success | Selesai dan berhasil | Check circle | `--ok` | Aksi selesai, dana masuk, tx terkonfirmasi |
| Pending | Sedang berjalan, menunggu sistem | Spinner / jam | `--wait` | Menyegel sesi, menunggu konfirmasi tx, menunggu payout tiba |
| Waiting on you | Menunggu tindakan pengguna | Tangan / panah | `--info` | Menunggu sign-in, menunggu tanda tangan wallet |
| Warning | Bisa lanjut, tapi ada hal penting | Segitiga | `--wait` | Risiko Junior, batas lebih kecil, jadwal pelunasan dekat |
| Error | Gagal, butuh perbaikan | Silang di lingkaran | `--error` | Gagal verifikasi, gagal connect payout account, transaksi, validasi |
| Info | Konteks netral | Info circle | `--info` | Penjelasan, catatan privasi |

Pending dan Waiting on you dibedakan: yang pertama dikerjakan sistem, yang kedua butuh pengguna. Teksnya harus menyebut siapa yang ditunggu.

### 7.2 Kanal

| Kanal | Dipakai untuk | Perilaku |
|---|---|---|
| Inline di field | Validasi form | Muncul di bawah field, fokus pindah ke error pertama saat submit. `aria-describedby`. |
| Banner halaman | Kondisi yang bertahan (advance aktif, auto-repay gagal, koneksi putus) | Di atas konten, tidak hilang sendiri, punya aksi. |
| Kartu status langkah | Hasil dan progres di dalam alur (Verify, Review, Done) | Menggantikan area aksi, berisi judul, penjelasan, aksi. |
| Toast | Konfirmasi singkat yang tidak butuh tindakan (kode disalin, tersimpan) | Maks 1 baris, 5 detik, jeda saat hover/fokus, bisa ditutup. Hanya untuk sukses/info. |
| Chip status | Status entitas (advance, deposit) di daftar dan header | Selalu ikon + teks. |
| Dialog konfirmasi | Hanya tindakan yang memutus alur atau tidak bisa dibatalkan | Jarang. Alert tidak muncul saat load dan tidak dipakai untuk aksi yang bisa di-undo (`alerts.md`). |

Aturan:
- **Error tidak pernah hilang sendiri.** Toast tidak dipakai untuk error.
- Pending tampil jika lebih dari 300 ms agar tidak berkedip. Jika lebih dari 10 detik, tambahkan "Still working… this can take up to a minute." Jika bisa dibatalkan, beri "Cancel".
- Tombol utama yang sedang diproses tetap aktif secara visual sampai request mulai, lalu menampilkan spinner dengan label berakhiran `…` ("Sending…").
- Setiap error menyebut status uang: "Nothing was charged." atau "Your balance is unchanged." Ini yang paling dicari pengguna fintech.
- Aksesibilitas: sukses/pending/info memakai `role="status"` (`aria-live="polite"`). Error memakai `role="alert"`. Fokus tidak dicuri oleh toast. Tidak ada auto-dismiss bagi pesan yang berisi tindakan.
- Animasi masuk pendek, hormati `prefers-reduced-motion`.

### 7.3 Aturan penulisan

- Struktur: **judul** (apa yang terjadi, maksimal 6 kata) + **isi** (kenapa dan apa dampaknya, maksimal 2 kalimat) + **aksi** (kata kerja spesifik).
- Kalimat aktif, orang kedua ("you"), tanpa permintaan maaf berlebihan, tanpa menyalahkan, tanpa jargon teknis (tidak ada "nullifier", "zkTLS", "tx" di sisi kreator).
- Kapitalisasi: **Title Case** untuk tombol, tab, dan judul halaman. **Sentence case** untuk semua pesan (judul dan isi). Satu aturan ini berlaku di semua layar.
- Aksi dinamai sama sepanjang alur: tombol "Cash Out Now" menghasilkan status "Cash out sent", bukan "Submitted".
- Angka: numeral ("3 payments"), nominal selalu `X,XXX.XX IDRX`. Tanggal spesifik ("Oct 21"), bukan "soon".
- Ellipsis `…` (satu karakter) untuk state berjalan: "Sealing your session…".
- Tanda kutip lengkung, spasi tak terputus antara angka dan satuan (`10&nbsp;MB`, `5,000,000.00&nbsp;IDRX`).

### 7.4 Katalog pesan (mock)

Format: **Judul** · isi · [aksi]. Semua string disimpan di satu file (`messages`) agar konsisten dan mudah diubah.

#### Verify

| Kejadian | Jenis | Kanal | Pesan |
|---|---|---|---|
| Menunggu sign-in | Waiting on you | Kartu langkah | **Waiting for you to sign in** · Finish signing in to AdSense in the window that just opened. · [Reopen Window] |
| Menyegel sesi | Pending | Kartu langkah | **Sealing your session…** · This takes about 20 seconds. We never see your password. |
| Lebih dari 10 detik | Pending | Kartu langkah | **Still working…** · This can take up to a minute. Please keep this tab open. · [Cancel] |
| Berhasil | Success | Kartu langkah | **Balance verified** · Final balance 8,400,000.00 IDRX, payable on the 21st. · [Continue] |
| Jendela ditutup | Info | Kartu langkah | **Sign-in was cancelled** · Nothing was shared. Try again when you’re ready. · [Try Again] |
| Gagal menyegel | Error | Kartu langkah | **We couldn’t seal your session** · Your data wasn’t saved. Check your connection and try again. · [Try Again] |
| Belum ada saldo final | Warning | Kartu langkah | **No final balance yet** · Google posts your balance around the 3rd. Come back then to cash out. · [Back To Dashboard] |
| Pakai metode cadangan | Warning | Banner | **Lower limit with this method** · Using YouTube Analytics, you can take up to 40% of your balance. · [Use AdSense Instead] |

#### Amount

| Kejadian | Jenis | Kanal | Pesan |
|---|---|---|---|
| Melebihi batas | Error | Inline | **Maximum is 5,880,000.00 IDRX.** Lower the amount to continue. |
| Di bawah minimum | Error | Inline | **Minimum is 100,000.00 IDRX.** |
| Angka tidak valid | Error | Inline | **Enter an amount, like 500,000.00.** |
| Penjelasan batas | Info | Popover | **Why this limit?** · Your limit comes from your last 12 months of earnings and how steady they are. You can take up to 70% of your final balance. |

#### Review

| Kejadian | Jenis | Kanal | Pesan |
|---|---|---|---|
| Menunggu persetujuan | Waiting on you | Kartu akun | **Waiting for you to approve** · Approve the connection in the window that just opened. · [Reopen Window] |
| Akun terhubung | Success | Chip | **Account linked** · Account ending in 4821. |
| Persetujuan gagal | Error | Kartu akun | **The connection wasn’t approved** · Nothing was set up and no funds moved. Try again to continue. · [Try Again] |
| Kirim | Pending | Tombol | **Sending…** |
| Payout sudah didanai | Error | Banner | **This payout is already funded** · Another lender has advanced it. Nothing was charged. · [Back To Dashboard] |
| Gagal kirim | Error | Banner | **Cash out didn’t go through** · Your balance is unchanged and nothing was charged. · [Try Again] |
| Alasan tombol nonaktif | Info | Teks bantu | Link your payout account and accept the repayment terms to continue. |

#### Done dan setelahnya

| Kejadian | Jenis | Kanal | Pesan |
|---|---|---|---|
| Dana dikirim | Pending | Kartu langkah | **Money’s on its way** · 5,000,000.00 IDRX is heading to your account. |
| Dana masuk | Success | Kartu langkah | **Money received** · 5,000,000.00 IDRX is in your account. We’ll collect 5,125,000.00 IDRX automatically on Oct 21. |
| Pelunasan dijadwalkan | Info | Banner dashboard | **Repayment on Oct 21** · We’ll collect 5,125,000.00 IDRX from your linked payout account when your payout arrives. |
| Pelunasan berhasil | Success | Banner + History | **Repaid on time** · 5,125,000.00 IDRX was collected. You received 3,275,000.00 IDRX. Your credit record was updated. |
| Pelunasan gagal | Error | Banner dashboard | **Auto-repay didn’t go through** · We couldn’t collect from your payout account. Make sure your payout has arrived, then retry before Oct 23. · [Retry Repayment] |
| Cash-out ditolak sementara | Info | Teks bantu | You have an active advance. You can cash out again after it’s repaid on Oct 21. |

#### LP

| Kejadian | Jenis | Kanal | Pesan |
|---|---|---|---|
| Belum connect | Info | Panel deposit | **Connect a wallet to deposit** · [Connect Wallet] |
| Jaringan salah | Error | Banner | **Wrong network** · Switch your wallet to the right network to continue. · [Switch Network] |
| Saldo kurang | Error | Inline | **You don’t have enough IDRX.** Your balance is 25,000,000.00 IDRX. |
| Melebihi kapasitas | Error | Inline | **Only 40,000,000.00 IDRX of space is left in Senior.** |
| Risiko Junior | Warning | Panel deposit | **Junior takes losses first** · If advances aren’t repaid, Junior absorbs losses before other tiers. You can lose part of your deposit. [ ] I understand this risk |
| Menunggu wallet | Waiting on you | Panel deposit | **Confirm in your wallet** · Approve the deposit in your wallet to continue. |
| Menunggu konfirmasi | Pending | Panel deposit | **Waiting for confirmation…** · This usually takes under a minute. 0x3f9a…c21e ↗ |
| Berhasil | Success | Toast + panel | **Deposit confirmed** · 10,000,000.00 IDRX added to Senior. 0x3f9a…c21e ↗ |
| Ditolak di wallet | Info | Panel deposit | **You rejected the request** · Nothing was deposited. · [Try Again] |
| Transaksi gagal | Error | Panel deposit | **Deposit failed** · The transaction didn’t go through and no funds moved. · [Try Again] |
| Salin | Success | Toast | **Copied** |

#### Global

| Kejadian | Jenis | Kanal | Pesan |
|---|---|---|---|
| Offline | Warning | Banner | **You’re offline** · We’ll reconnect automatically. Your progress is saved. |
| Sesi habis | Info | Banner | **You were signed out** · Sign in again to continue. Your progress was saved. · [Sign In] |
| Error umum | Error | Banner | **Something went wrong on our side** · Nothing was charged. Try again in a moment. · [Try Again] |

### 7.5 Siklus status entitas

Advance (kreator): `Verifying → Ready → Sending → Active → Repaid` · cabang: `Failed` (sebelum kirim), `Repay Failed` (setelah tanggal 21).
Deposit (LP): `Awaiting Wallet → Confirming → Deposited` · cabang: `Rejected`, `Failed`.
Chip memakai kata yang sama di dashboard, History, dan pesan.

## 8. Responsif

| Lebar | Perilaku |
|---|---|
| ≥1024 px | Desktop penuh. Dua kolom di Review, panel deposit sticky di Vault. |
| 640–1023 px | Satu kolom lebar sedang, panel deposit di bawah kartu lapis. |
| <640 px | Satu kolom. Bottom tab bar. Panel deposit jadi bottom sheet. Tabel History jadi daftar kartu. |

- Didukung minimal 360 px. Tanpa scroll horizontal di semua lebar.
- Gunakan CSS Grid dan `min-height: 100dvh`, bukan `100vh`.
- Target sentuh minimal 44×44 pt di mobile (`accessibility.md`). Jarak antar kontrol cukup.
- Konten mengikuti safe area (`env(safe-area-inset-*)`) untuk tab bar dan sheet.
- Layout mengikuti ruang tersedia, bukan perangkat. Fungsi sama di semua ukuran.
- Teks harus tetap terbaca di ukuran font sistem terbesar (hierarki tetap, tanpa teks terpotong). Angka panjang memakai `min-w-0` dan tidak terpotong tanpa tooltip.

## 9. Aksesibilitas dan kualitas (checklist)

- Kontras teks ≥4.5:1 (≥3:1 untuk teks besar dan ikon). Hitung dari hex saat implementasi.
- Fokus terlihat: `:focus-visible` ring jelas, tidak pernah `outline: none` tanpa pengganti. Sticky header tidak menutupi elemen yang fokus.
- Semua kontrol bisa dipakai dengan keyboard. Tombol untuk aksi, `<a>` untuk navigasi. Skip link ke konten utama.
- Form: label di atas input (bukan placeholder), `type`, `inputmode`, `autocomplete`, `name` yang tepat. Error inline, fokus ke error pertama. Paste tidak diblokir.
- Ikon-only wajib `aria-label`. Gambar punya `alt`.
- Tidak `transition: all`. Animasi hanya `transform`/`opacity`, bisa dihentikan, hormati `prefers-reduced-motion`.
- URL mencerminkan state (langkah cash-out, lapis terpilih via query `?tier=senior`).
- Peringatan sebelum meninggalkan alur yang berisi input belum dikirim.
- `meta theme-color` sesuai latar. `color-scheme: light`.
- Gambar punya `width`/`height`. Gambar di bawah lipatan `loading="lazy"`.
- Semua layar punya state loading (skeleton), kosong, dan error.

## 10. Catatan implementasi (ringkas)

Repo masih template Vite + React 19 (`src/App.tsx`, `src/index.css`).
- Styling: CSS biasa dengan custom property untuk token di atas. Tidak perlu menambah Tailwind untuk scope ini.
- Routing: `react-router` (satu dependency baru) untuk URL per langkah. Pin versi tepat.
- Font: paket `@fontsource` (Bricolage Grotesque, Geist, Geist Mono), self-host.
- Ikon: `@phosphor-icons/react`.
- Mock: satu modul `mock/` berisi data dan fungsi async dengan jeda buatan (500–2500 ms) agar state pending nyata terlihat. Verifikasi AdSense diprarekam/disimulasikan. Satu fungsi memicu tiap skenario error lewat parameter query `?demo=link-fail|funded|repay-fail` supaya juri bisa melihat semua jalur. Satu file `messages` untuk seluruh copy.
- Onchain: advance, deposit LP, dan `settle()` memanggil kontrak sungguhan (Anvil). Satu script keeper mensimulasikan payout Google — mengirim IDRX ke payout account kreator saat waktu di-warp ke tanggal 21 — lalu `settle()` menarik pelunasan dari akun itu. Di produksi, langkah bind payout account menjadi autodebet rekening via open finance berlisensi BI; itu dinyatakan di demo, tidak di-mock sebagai bank.
- Format nominal: satu helper `formatIDRX(cents)`.
- Satu cek runnable: tes kecil `formatIDRX` dan `fee/repay` (money path), tanpa framework tambahan selain yang sudah ada atau Vitest bila diminta.

## 11. Keputusan final (dikonfirmasi)

1. LP connect wallet. Kreator tidak melihat istilah crypto: "Connect Payout Account" adalah satu tap yang di balik layar menandatangani approval wallet. Di produksi langkah ini menjadi bind rekening via autodebet partner berlisensi BI — itu dinyatakan di demo, bukan di-mock sebagai bank.
2. Satu baris kecil "Verified onchain" dengan tautan explorer tetap ada di dashboard kreator. Dianggap tidak melanggar aturan "tanpa istilah crypto" karena hanya tautan bukti, bukan aksi wallet.
3. Angka mock (yield, kapasitas, batas 40% metode cadangan, tanggal Oct 21/23) hanya contoh dan boleh diubah saat implementasi.
4. Aksen jeruk `#FF5A1F` final. Jika arah berubah, cukup ganti token `--accent` lalu periksa ulang kontras.
5. Parameter `?demo=` hanya untuk presentasi, tidak muncul di UI.

## 12. Urutan pengerjaan yang disarankan

1. Token, font, helper `formatIDRX`, file `messages`, komponen status (chip, banner, toast, kartu langkah).
2. Layout dan nav (top bar, bottom tab bar).
3. Cash-out 4 langkah + payday rail + skenario error.
4. Dashboard dan History.
5. Vault + panel deposit + skenario error.
6. Landing.
7. Audit: guideline Vercel, kontras, keyboard, ukuran 360 px, `prefers-reduced-motion`.
