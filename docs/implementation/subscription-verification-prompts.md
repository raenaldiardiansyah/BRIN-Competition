# Verification Prompts

Dokumen ini berisi panduan verifikasi untuk agen AI dalam menguji keberhasilan tiap fase atau Component Prompt yang telah dikerjakan. 
Agen tidak boleh mendeklarasikan *Completion* sebelum memvalidasi kriteria di bawah ini secara eksplisit.

---

## Verification P0-01: Audit Existing Stack

**Konteks Verifikasi:**
P0-01 adalah audit pasif (read-only) untuk mengumpulkan fakta terkait kesiapan instalasi Tailwind v4 dan shadcn Base UI, serta mengidentifikasi risiko namespace dan penempatan portal root.

**Langkah Validasi:**
1. **Verifikasi Cakupan Laporan:** 
   - Pastikan seluruh required audit target (dari Acceptance Criteria P0-01) terlaporkan secara mendetail.
   - Pastikan findings telah diklasifikasikan secara tegas menjadi `PASS`, `RISK`, `BLOCKED`, atau `NOT FOUND`.
   - Pastikan **setiap temuan menyertakan evidence** yang jelas berupa path file dan baris, atau output dari command eksekusi (`git`, `ls`, dll.).
2. **Zero-Mutation Check:** 
   - Pastikan agen tidak membuat, memodifikasi, atau menghapus file source code, file konfigurasi, `package.json`, maupun lockfile.
   - Pastikan agen tidak menjalankan perintah mutasi (seperti `npm install`, `shadcn init`, generator, dll).
   - Pastikan tidak ada file baru yang dibuat selain dokumen governance yang disetujui pengguna.
   - Pastikan P0-02 belum dibuat atau dijalankan.
3. **Konfirmasi Git Status:** 
   - Lakukan pemeriksaan status workspace.
     ```bash
     git diff --stat
     git status --short
     ```
   - Hasil yang diekspektasikan adalah bersih (clean working directory terkait source code aplikasi).

**Exit Criteria:**
- Preflight Report yang disajikan telah memenuhi 100% target audit dengan klasifikasi dan evidence.
- Tidak ada source/config/dependency mutation.
- Instruksi pengguna terkait langkah penanganan status `RISK` atau `BLOCKED` (apabila ada) dapat segera dirumuskan.
