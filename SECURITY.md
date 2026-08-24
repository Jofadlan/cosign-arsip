# Kebijakan Keamanan — CoSign

## Laporkan Kerentanan

Jika kamu menemukan kerentanan keamanan pada CoSign, **jangan** membuka issue
publik. Kirim laporan langsung ke maintainer agar bisa diperbaiki sebelum
diungkap.

**Kontak keamanan:** **Hudya** (Industrial Lecturer CCIT-FTUI) —
**mhudyaramadhana@gmail.com**

Sertakan dalam laporan:

- Deskripsi kerentanan dan potensi dampaknya
- Langkah reproduksi (sebaiknya minimal, tanpa data sensitif)
- Versi/branch yang terpengaruh
- (Opsional) usulan perbaikan

## Proses Penanganan

1. Maintainer menerima laporan dan mengonfirmasi dalam **48 jam**.
2. Kerentanan divalidasi dan kerentanan serupa diperiksa.
3. Perbaikan dikembangkan secara privat bila diperlukan.
4. Setelah diperbaiki, maintainer mengumumkan rilis/perbaikan dan mengkredit
   pelapor (jika diinginkan).

## Area yang Perlu Diperhatikan

- **Upload file** (`uploads/`) — validasi tipe/ukuran media, hindari eksekusi file
  berbahaya, beri nama file acak (UUID).
- **Sesi** — cookie `sid` hanya `httpOnly`; pastikan session dihapus saat logout.
- **Password** — wajib di-hash argon2 (`Bun.password`), jangan pernah menyimpan
  plaintext.
- **CSRF / CORS** — batasi `origin` sesuai domain aplikasi.
- **Supabase** — jangan commit `SUPABASE_URL` / `SUPABASE_ANON_KEY`; jangan
  aktifkan public RLS tanpa kebijakan yang jelas.

## Rujukan

- [CONTRIBUTING.md](CONTRIBUTING.md) — panduan kontribusi & keamanan
- [README.md](README.md) — quickstart & struktur proyek
