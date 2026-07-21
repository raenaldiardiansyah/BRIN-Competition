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

---

## Verification P0-02: Tailwind v4 & Base UI Dry-Run Proof

**Konteks Verifikasi:**
P0-02 adalah tahap persiapan (dry-run) untuk mengonfirmasi kompatibilitas shadcn CLI Base UI dengan Tailwind v4. Tahap ini krusial untuk mencegah modifikasi file yang tidak diinginkan dan mencegah instalasi *legacy dependencies* (seperti Lucide/Radix) sebelum eksekusi sebenarnya (P0-03/P0-04).

**Langkah Validasi:**
1. **Verifikasi Cakupan Laporan Dry-Run:**
   - Pastikan laporan mencantumkan output aktual secara jelas dari command `shadcn info`.
   - Pastikan laporan mencantumkan output aktual secara jelas dari command `shadcn add button --dry-run`.
   - Pastikan prefix yang dihasilkan CLI (misal `tw:`) telah diidentifikasi dan dicatat.
   - Pastikan terdapat daftar lengkap yang memuat nama dan path setiap file yang direncanakan untuk dibuat atau diubah oleh CLI.
2. **Validasi Kepatuhan Larangan (Anti-Pattern Check):**
   - Periksa output CLI (dry-run log) dan pastikan **TIDAK ADA** indikasi CLI akan menambahkan library `lucide-react` atau paket `@radix-ui/*`.
   - Periksa output CLI dan pastikan **TIDAK ADA** indikasi CLI akan membuat atau mengubah `apps/web/src/components/ui/button.tsx` (yang mana dilarang).
3. **Zero-Regression Verification:**
   - Karena tahap ini merupakan *dry-run*, validasi bahwa repositori tidak mengalami mutasi sekecil apa pun.
   - Jalankan `git status --short` dan pastikan outputnya **kosong** (clean).
   - Jalankan `git diff --check` dan `git diff --stat` untuk memastikan tidak ada perubahan file konfigurasi, `package.json`, atau *lockfile*.

**Exit Criteria:**
- Dry-Run Report telah disajikan lengkap dan mencakup prefix aktual.
- Daftar file target CLI tercatat secara eksplisit sebelum persetujuan (approval).
- Repositori dalam keadaan bersih (*zero-regression* diverifikasi via Git).
- Instruksi pengguna untuk tahap modifikasi nyata (P0-03 Token & Portal Implementation atau instalasi nyata shadcn init) telah dapat dirumuskan.

---

## Verification P0-03: Isolated shadcn Initialization Proof

**Konteks Verifikasi:**
P0-03 wajib memeriksa dua konteks secara terpisah untuk memastikan inisialisasi shadcn Base UI sepenuhnya terisolasi dan tidak mencemari primary working tree.

**Langkah Validasi:**
1. **Verifikasi Primary Working Tree:**
   - Jalankan dan buktikan hasil perintah berikut tetap bersih (kosong):
     ```bash
     git status --short
     git diff --check
     git diff --stat
     ```
2. **Verifikasi Temporary Worktree:**
   - Pastikan laporan menampilkan data berikut secara eksplisit:
     - Path temporary worktree.
     - Commit SHA sumber (harus identik dengan HEAD yang bersih).
     - Command aktual yang dieksekusi (`shadcn init ...`).
     - Semua prompt dan jawaban CLI.
     - Hasil `git status --short` dan `git diff --stat` di temporary worktree.
     - Output `git diff` untuk **setiap** file yang dibuat/diubah.
     - Delta `package.json` dan lockfile.
     - Isi penuh file `components.json` yang dihasilkan.
     - Konfirmasi: Base UI selection, icon library, alias, CSS path, dan Tailwind config path.
     - Keberadaan Lucide atau Radix (harus **NOT FOUND**).
     - Perubahan pada legacy `components/ui/` (harus **NOT FOUND**).
     - Hasil dari pembersihan (cleanup result) temporary worktree.
3. **Completion Boundary (Boundary Eksekusi):**
   - Setelah pelaporan selesai, temporary worktree WAJIB dihapus.
   - Buktikan ulang bahwa primary working tree tetap bersih setelah penghapusan.
   - Dilarang menerapkan hasil *initialization* ke primary working tree.
   - Dilarang membuat commit.
   - Agen wajib **berhenti** segera setelah memberikan *Initialization Diff Report*.

**Exit Criteria:**
- *Initialization Diff Report* mendeskripsikan secara transparan dan detail seluruh perubahan yang di-generate CLI pada worktree terisolasi.
- Primary working tree dibuktikan 100% *zero-mutation* (tidak ternoda sedikit pun).
- Temporary worktree berhasil dibersihkan/dihapus dengan aman.
- Tidak ada pelanggaran *Stop Conditions*.
- Repositori siap, namun agen harus menunggu keputusan pengguna sebelum instalasi shadcn dilakukan secara permanen.
