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
- Primary working tree dibuktikan dengan: No repository mutation observed berdasarkan Git pre-check dan post-check.
- Temporary worktree berhasil dibersihkan/dihapus dengan aman.
- Tidak ada pelanggaran *Stop Conditions*.
- Repositori siap, namun agen harus menunggu keputusan pengguna sebelum instalasi shadcn dilakukan secara permanen.

---

## Verification P0-04: shadcn Preset Selection and Decode Audit

**Konteks Verifikasi:**
P0-04 adalah proses read-only terstruktur untuk menemukan kandidat *official opaque preset code* shadcn, mendekodenya, dan memastikan kesesuaian mutlak dengan arsitektur ProjectLink. Fokus utama adalah mengaudit konfigurasi Ikon dan memvalidasi bahwa *component base* diakui sebagai *parameter terpisah*. Keputusan pemilihan preset harus didasarkan pada output JSON aktual yang valid.

**Langkah Validasi:**
1. **Verifikasi Git Sebelum P0-04 (Zero-Mutation Pre-Check):**
   - Eksekusi `git status --short`, `git diff --check`, `git diff --stat` sebelum memulai command CLI.
2. **Verifikasi Candidate Distinction & Discovery:**
   - Pastikan agen **tidak** mencoba men-decode *named preset* (seperti `nova`, `vega`).
   - Pastikan agen men-decode **official opaque preset code** (exact code yang berasal dari dokumentasi resmi atau output resmi shadcn/create, contoh: `b5owWMfJ8l`, `a2r6bw`).
   - Pastikan sumber official opaque preset code dinyatakan dengan jelas (URL resmi, changelog, API reference).
   - Verifikasi command aktual yang dijalankan: `shadcn preset decode <code> --json`.
   - Periksa ketersediaan output JSON Decode lengkap (mencakup: `style`, `baseColor`, `theme`, `iconLibrary`, `font`, `radius`).
3. **Validasi Pemisahan Component Base:**
   - Pastikan verifikator mengakui bahwa JSON preset tidak dituntut untuk mengenkode atribut *component base*.
   - Pastikan matriks mencatat *Component base: SEPARATE PARAMETER*.
4. **Anti-Pattern & Icon Library Audit:**
   - Verifikasi ketat terhadap properti `iconLibrary` dari hasil JSON sesuai aturan:
     - `phosphor` → eligible untuk APPROVED CANDIDATE apabila persyaratan lain terpenuhi
     - `lucide` → REJECTED
     - icon library selain phosphor → REJECTED untuk konfigurasi final ProjectLink
     - icon library tidak tersedia atau tidak dapat diverifikasi → BLOCKED atau NOT FOUND
   - Agen **dilarang** menganggap icon library non-Phosphor dapat diganti dengan aman tanpa proof terpisah.
5. **Verifikasi Matriks Keputusan Akhir:**
   - P0-04 execution status (`PASS` | `PARTIAL` | `BLOCKED`) dan Individual candidate decision (`APPROVED CANDIDATE`, `REJECTED`, `BLOCKED`, `NOT FOUND`) wajib dipisahkan dan tersedia.
   - P0-04 boleh berstatus `PASS` meskipun semua kandidat `REJECTED`, selama minimal satu official opaque preset code berhasil didecode, raw output tersedia, dan repositori mematuhi "No repository mutation observed berdasarkan Git pre-check dan post-check".
6. **Verifikasi Git Sesudah P0-04 (Zero-Mutation Post-Check):**
   - Eksekusi ulang `git status --short`, `git diff --check`, `git diff --stat`.
   - Tidak boleh ada mutasi (0 bytes changed) pada repository (termasuk *dependency*).

**Exit Criteria:**
- *Official opaque preset code* digunakan untuk *decode*.
- Matriks evaluasi (termasuk *separate parameter* untuk Base UI) lengkap.
- Evaluasi Ikon ditaati secara mutlak (Phosphor only, selebihnya ditolak).
- Repositori (sebelum dan sesudah) dibuktikan mematuhi "No repository mutation observed berdasarkan Git pre-check dan post-check".
- Agen tidak membuat commit dan berhenti untuk meminta konfirmasi.

---

## Verification P0-B: Tailwind v4 Foundation, CSS Isolation, Scoped Tokens, and Portal Root

**Konteks Verifikasi:**
P0-B memastikan fondasi CSS Tailwind v4, isolasi melalui `.pl-ui-scope`, dan keberadaan *portal root* dapat diimplementasikan secara aman tanpa memicu regresi pada UI legacy, global selector, maupun konfigurasi workspace.

**Langkah Validasi:**

### Sebelum Implementasi (Pre-check)
1. Jalankan pemeriksaan status Git dan build dengan prosedur berikut:
   - Baca field `name` dari `apps/web/package.json`.
   - Gunakan actual workspace package name:
     ```bash
     git status --short
     git diff --check
     git diff --stat
     pnpm --filter "<actual-package-name>" build
     ```
   - Jika filter workspace tidak cocok, gunakan: `pnpm --dir apps/web build`
   - Jangan mengubah field package name untuk membuat verification berhasil.

### Setelah Implementasi (Post-check)
2. Jalankan pemeriksaan ulang untuk Git dan build dengan prosedur yang sama:
   ```bash
   git status --short
   git diff --check
   git diff --stat
   pnpm --filter "<actual-package-name>" build
   ```
   (Atau `pnpm --dir apps/web build` jika fallback digunakan).
3. Lakukan pengauditan ketat terhadap parameter berikut (Setiap temuan wajib berstatus: `PASS`, `RISK`, `BLOCKED`, atau `NOT FOUND`):
   - **Dependency delta:** Pastikan hanya package Tailwind v4 dan PostCSS yang disetujui yang ditambahkan.
   - **Lockfile delta:** Evaluasi perubahan `pnpm-lock.yaml`.
   - **PostCSS config:** Verifikasi konfigurasi `@tailwindcss/postcss`.
   - **Tailwind version:** Buktikan instalasi adalah versi 4.x.
   - **CSS import order:** Periksa lokasi impor CSS baru di `layout.tsx`.
   - **Prefix proof:** Pastikan prefix berjalan sesuai syntax v4.
   - **Source scanning proof:** Verifikasi aturan `@source` hanya melingkupi UI baru.
   - **Absence of Preflight:** Pastikan *global reset* Tailwind dinonaktifkan sepenuhnya.
   - **Absence of global reset:** Pastikan tidak ada injeksi styling pada elemen bawaan seperti `body` atau `a`.
   - **`.pl-ui-scope` containment:** Buktikan utilitas Tailwind terikat pada ruang lingkup ini.
   - **Portal root existence:** Periksa ketersediaan `#pl-ui-portal-root` di *root layout*.
   - **Navbar regression:** Pastikan navbar tidak mengalami perubahan layout/gaya (no mutation).
   - **Homepage regression:** Pastikan homepage existing tidak terpengaruh (no mutation).
   - **No mutation pada legacy UI:** Pastikan isi folder `components/ui` legacy tidak disentuh.
   - **No Lucide:** Pastikan tidak terinstal dependensi `lucide-react`.
   - **No Radix:** Pastikan tidak terinstal dependensi `@radix-ui/*` selain Base UI.
   - **TypeScript/build result:** Build harus lolos tanpa error tsc.

**Exit Criteria:**
- Verifikasi sebelum dan sesudah eksekusi terlaporkan sepenuhnya.
- Laporan status (`PASS`, `RISK`, dll) untuk seluruh parameter audit tersedia.
- Build Next.js dan TypeScript berhasil setelah fondasi disisipkan.
- Temporary proof (jika ada) terhapus sebelum laporan diserahkan, kecuali dinyatakan eksplisit.
- Agen berhenti dan menunggu konfirmasi sebelum melanjutkan (tidak ada eksekusi P0-C/komponen).
