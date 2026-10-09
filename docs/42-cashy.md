# Cashy — Uang Maju dari Penghasilan YouTube-mu

## 1. Nama project

Cashy (dari "cash" — uang yang sudah pasti milikmu, tinggal menunggu tanggal cair).

## 2. One line pitch

Kreator YouTube yang penghasilannya sudah jadi tapi baru cair tanggal 21 bisa langsung mengambil sebagian uangnya hari ini — dengan biaya kecil sekali, tanpa bunga, tanpa pinjaman.

## 3. Problem statement + data

Kreator YouTube yang sudah stabil menghasilkan uang dari iklan menghadapi masalah yang sama: uangnya datang terlambat, pintu pinjaman yang ada semuanya tidak cocok.

Data yang membuktikan masalahnya nyata:

- Uang jalan duluan, masuk belakangan: pendapatan tercatat setiap hari, tapi baru dibayarkan Google tanggal 21–26 bulan berikutnya — biaya produksi jalan tiap minggu.
- Bank menolak (tanpa agunan, tanpa slip gaji); aplikasi gajian maju hanya untuk pegawai yang punya atasan; pinjaman online memungut 0,3% per hari.
- Layanan pinjaman kreator yang ada (Spotter, Bump) hanya melayani kreator besar, dan tidak ada yang mencegah satu payout yang sama didanai berkali-kali oleh aplikasi berbeda.
- **YouTube Partner Program membayar $70 miliar+ dalam 3 tahun**; Indonesia peringkat 4 dunia dengan 151 juta pengguna dan ~3.000 channel 1M+ subscriber.
- Preseden Spotter: $600 juta sudah tersalurkan = permintaan terbukti; jatuhnya (konsentrasi ke segelintir bintang + pergeseran ke Shorts) = pelajaran desain kami.

**Pasar sudah terbukti ada pemain serupa untuk YouTube — semuanya hidup dan melayani kreator, tapi semuanya modal tertutup dan tanpa Asia Tenggara:**

- **MilX** (dukungan AIR Media-Tech, resmi YouTube Partner): punya produk dua tingkat persis desain kami — *Advance Funds* (uang yang sudah dihasilkan tapi belum dibayar Google) dan *Active Funds* (proyeksi masa depan hingga 6 bulan), repay otomatis pas payout tiba. Status: **$500 juta+ pendapatan kreator diproses, 5.000+ kreator di 44 negara, $17,6 juta sudah di-advance** — bukti paling kuat bahwa demand-nya nyata, sekaligus bukti modal yang dibutuhkan untuk membuktikan model ini kecil.
- **CreatorAdvance** (US/Kanada/UK/Australia): OAuth resmi read-only ke YouTube, advance 50–80% penghasilan bulanan, fee flat 4–10% per umur channel, repay otomatis — rentang fee dan rasio advance-nya mirip model kami (2,5–3%, ≤70% estimasi). Masih berjalan, tapi tidak masuk Indonesia.
- **Fundmates** ($50 juta+ tersalur ke 250+ channel) dan **Spotter** ($940 juta ke 735+ channel): melayani kreator menengah-besar dengan dana tertutup dari investor (Spotter: $200 juta Series D dari SoftBank) — pasar berjalan dengan model "kamar tertutup": uangnya dari satu meja, keputusan underwriting hitam-box, posisinya tidak bisa diverifikasi siapa pun.

Kesimpulan pasar: model advance penghasilan YouTube **sudah terbukti menghidupi bisnis nyata**, tapi semua pemain membangunnya sebagai neraca pribadi di web2 — belum ada yang pool terbuka on-chain, nullifier anti didanai-ganda, dan utamakan kreator Asia Tenggara. Celah itu posisi Cashy.

## 4. Penjelasan projek

Cashy memajukan sebagian penghasilan AdSense yang **sudah final** — angka yang Google sendiri sudah tetapkan dan akan dibayar tanggal 21–26 — bukan uang hasil tebakan. Kreator login sendiri ke akun AdSense-nya, sistem menyegel bukti angka itu secara kriptografis, uang cair, lalu saat payout Google masuk, sistem otomatis memotong kembali; biayanya satu kali dan terlihat jelas di depan.

## 5. Fitur / mekanisme inti

Alur intinya: verifikasi → penilaian → cair → pelunasan otomatis, dengan enam mekanisme:

- **Verifikasi dua jalur**: utama = zkTLS (kreator login sendiri, sesi browser-nya disegel kriptografis — bukti menempel ke kreator); kedua = API resmi YouTube Analytics sebagai data pendukung dan cadangan (kalau dipakai sebagai bukti pengganti, batas cair lebih kecil demi keamanan).
- **Bureau System**: penilai otomatis yang menentukan berapa persen saldo boleh dicairkan, dari 6 sifat historis channel — decay niche, sinyal kesehatan, volatilitas, tren arah, konsistensi upload, anomali traffic palsu. Dibangun sebagai sistem aturan (rule-based), bukan AI: setiap sifat dihitung dengan rumus jelas dari data 12 bulan (misal volatilitas = standar deviasi, tren arah = kemiringan regresi, decay niche = tabel topik → faktor), lalu rata tertimbang jadi rasio batas (misal 40–70%). Angka sama selalu menghasilkan batas sama — teraudit, bisa dites, dan bisa dijelaskan ke kreator tanpa kotak hitam.
- **Advance tanpa tebakan**: hanya atas saldo final yang Google posting ke halaman Pembayaran sekitar tanggal 3 (siap dicairkan sampai tanggal 20) — uang yang sudah pasti milik kreator, nol prediksi; advance di jendela tanpa saldo final (21–3) jadi fitur lanjutan yang di-underwrite bureau.
- **Pelunasan otomatis (rail debit)**: via open finance berlisensi BI (Ayoconnect) — kreator bind rekening sekali seperti langganan Google Play, lalu uang kembali otomatis saat payout mendarat; opsi kedua = rekening virtual ber-nama sebagai tujuan payout (pelunasan terkuat, tapi verifikasinya berhari-hari).
- **Anti didanai dua kali**: satu payout punya "capai" unik onchain — lender mana pun bisa cek payout itu sudah diambil atau belum, jadi tidak bisa dimajukan dua kali oleh aplikasi berbeda.
- **Pool 3 lapis + rapor kredit**: dana dari investor tersusun jadi lapis aman (senior), penyangga rugi (junior), dan cadangan; setiap pelunasan tepat waktu tercatat onchain jadi rapor kreator yang bisa dibawa ke lender mana pun.

*Setelah hackathon: advance prediktif di jendela gelap (21–3), naik ke rekening virtual ber-nama untuk ratio penuh, isi pool lewat LP provider (vault sebagai pipa, provider sebagai airnya), growth note untuk pendanaan produksi.*

## 6. Tech stack

- **On-chain**: Foundry/Anvil; kontrak ERC-4626 (vault 3 lapis), registri nullifier, waterfall sweep; smart account (ERC-4337) untuk rail sweep; warp waktu ke tanggal 21 di demo.
- **zkTLS**: TLSNotary (MPC-TLS) — notarisasi sesi Studio/AdSense + halaman pembayaran; presentasi selektif (yang terlihat cuma ringkasan "12 bulan di kisaran $3–4rb", angka penuh tidak bocor).
- **Data**: OAuth YouTube Analytics API (scope `yt-analytics-monetary.readonly`) untuk histori estimasi; open finance API (mock Ayoconnect) untuk debit.
- **Bureau System**: aturan scoring transparan (bukan AI, bukan kotak hitam) yang membaca histori pendapatan dari verifikasi dua jalur; satu fungsi murni histori → rasio batas.
- **Demo**: mock YouTube Studio/AdSense + halaman pembayaran + "lender nakal" — yang hidup onchain: nullifier, waterfall, pool (yang dinilai juri).

## 7. Model bisnis

- **Fee tetap 2,5–3% per advance**, terlihat di depan, tanpa bunga tanpa tip — dikontraskan dengan pinjol 0,3%/hari.
- **Take rate pool** dari hasil fee yang mengalir ke penyedia dana.
- *Masa depan*: API anti-stacking berbayar untuk lender web2 (produk dari registri nullifier), lisensi bureau, dan growth note via mitra berizin OJK untuk kreator dengan rapor bersih.

## 8. Kenapa harus onchain

Masalah yang diselesaikan blockchain: **"satu payout didanai dua kali"** — solusinya satu registri bersama yang dipercaya semua lender, dan itu tidak mungkin dimiliki satu perusahaan: kalau milik Cashy, lender pesaing tidak mau menaruh data di database kompetitornya sendiri. Di onchain, registri nullifier milik tidak seorang pun tapi bisa dibaca semua orang — plus aturan pool dan rapor kredit ditaruh sekali sebagai kode yang tidak bisa diubah diam-diam, jadi kepercayaan pindah dari "percaya founder" ke "percaya matematika".

Kalimat satu: **EWA biasa = satu bank dan satu nasabah — cukup database. Cashy = banyak lender pesaing berbagi satu kebenaran tentang satu payout — hanya mungkin di tempat yang tidak dimiliki siapa pun.**

## 9. Flowchart happy flow user

```
[1. Kreator login Google + zkTLS ke halaman AdSense]
        ↓
[2. Sistem lihat saldo final "akan cair tanggal 21"]
        ↓
[3. Bureau System tentukan berapa boleh dicairkan]
        ↓
[4. Kreator bind rekening (seperti langganan)]
        ↓
[5. Uang maju cair HARI INI, fee tampil di depan]
        ↓
[6. Tanggal 21: payout Google masuk rekening]
        ↓
[7. Debit otomatis: potong advance + fee]
        ↓
[8. Sisa payout utuh untuk kreator
   + rapor "tepat waktu" tercatat onchain]
```
