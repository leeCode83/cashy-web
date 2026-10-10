// Mock "Info pembayaran" AdSense untuk zkTLS (zkPass TransGate).
// Kontrak dengan schema (lihat README): NAMA key tidak boleh berubah —
// payment_id (nullifier), balance_final, currency. NILAI payment_id sengaja
// berputar per bucket waktu: tiap window dapat uHash segar sehingga demo
// advance bisa diulang tanpa tersangkut registry "payout sudah didanai".
// ponytail: bucket 2 menit = nullifier praktis tidak pernah memblokir (dua
// segel TransGate tak selesai dalam satu window); naikkan jadi per jam bila
// mau tampilan stabil saat halaman di-refresh berulang.
const BUCKET_MS = 2 * 60 * 1000;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // no-store: jangan sampai TransGate dapat salinan cache dari window sebelumnya
  res.setHeader('Cache-Control', 'no-store');

  const bucket = Math.floor(Date.now() / BUCKET_MS);
  res.status(200).json({
    payment_id: 'PAY-2026-09-0001834-B' + bucket,
    creator_id: 'pub-774-221-9902',
    period: '2026-09',
    balance_final: 8400000,
    currency: 'IDRX',
    payout_window: '21 – 26 Oktober 2026',
    estimate_next: 9214750,
    generated_at: new Date().toISOString(),
  });
};
