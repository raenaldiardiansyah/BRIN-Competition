# Component Implementation Prompts

Dokumen ini berisi spesifikasi instruksi (Component Prompt) untuk agen AI yang mengimplementasikan fitur sesuai dengan `Implementation Plan v3`.

> **ATURAN EKSEKUSI:** Agen hanya boleh mengeksekusi SATU Component Prompt dalam satu siklus. Dilarang lanjut ke prompt berikutnya secara otomatis.

---

## P0-01: Existing Stack and Tailwind Isolation Audit

**1. Tujuan**
Melakukan audit menyeluruh dan pasif (read-only) terhadap codebase untuk memastikan kesiapan instalasi Tailwind v4 dan shadcn Base UI. Audit mencakup pemeriksaan struktur package (root dan apps/web), package manager boundaries, sisa konfigurasi Tailwind v3, urutan impor CSS, alias TypeScript, keberadaan library UI (Phosphor, React Bits, Lucide, Radix), risiko namespace `components/shadcn/` vs `components/ui/`, root layout untuk penempatan portal root (`#pl-ui-portal-root`), dan risiko global CSS regression.

**2. Lokasi file dan route/parent**
- `package.json` (Root & `apps/web`)
- `apps/web/postcss.config.mjs` (atau ekivalen)
- `apps/web/src/app/globals.css` (atau file global CSS utama)
- `apps/web/src/app/layout.tsx` (atau root layout)
- `tsconfig.json` / `apps/web/tsconfig.json` (untuk path aliases)
- Folder `apps/web/src/styles/`
- Folder `apps/web/src/components/ui/` dan keberadaan `apps/web/src/components/shadcn/`

**3. Official references**
- Tailwind v4 Documentation: Struktur CSS-first tanpa konfigurasi eksternal.
- PostCSS configuration.

**4. Data source**
Not applicable — audit-only, no UI implementation.

**5. shadcn components**
Not applicable — audit-only, no UI implementation.

**6. React Bits**
Not applicable — audit-only, no UI implementation.

**7. Phosphor icons**
Not applicable — audit-only, no UI implementation.

**8. Struktur visual/output**
Not applicable — audit-only, no rendered UI. Output berupa Preflight Report berbentuk teks.

**9. Interaksi**
Not applicable — audit-only, no UI implementation.

**10. State**
Not applicable — audit-only, no UI implementation.

**11. Responsive behavior**
Not applicable — audit-only, no rendered UI.

**12. Accessibility**
Not applicable for output UI; audit report must remain readable.

**13. Styling constraints**
Not applicable — audit-only, no UI implementation.

**14. Forbidden changes (Hal yang dilarang)**
- JANGAN menjalankan `npm install`, `pnpm install`, atau memodifikasi lockfile.
- JANGAN menghapus, menambah, atau memodifikasi source file, konfigurasi, atau `package.json`.
- JANGAN menjalankan generator seperti `shadcn init`.
- Dilarang membuat commit.
- Dilarang mengimplementasikan namespace atau portal root (hanya audit kesiapan).

**15. Acceptance criteria**
Menghasilkan Preflight Report yang berisi temuan untuk seluruh target audit:
- Root dan apps/web package stack.
- Package manager dan workspace boundaries.
- Tailwind/PostCSS existing & sisa konfigurasi Tailwind v3 (seperti `tailwind.config.ts`, `corePlugins`).
- Urutan import CSS di `globals.css` / layout.
- tsconfig aliases.
- Phosphor dependency.
- React Bits dependencies.
- Keberadaan existing `components/ui/`.
- Keberadaan atau collision risk `components/shadcn/`.
- Existing root layout dan kesiapan penempatan `#pl-ui-portal-root`.
- Identifikasi global versus scoped CSS variables.
- Risiko navbar/global regression.
Setiap temuan harus diklasifikasikan sebagai PASS, RISK, BLOCKED, atau NOT FOUND, beserta evidence aktual (path, baris, output).

**16. Verification**
Merujuk ke `Verification Prompt P0-01` di `subscription-verification-prompts.md`.

**17. Files allowed to modify**
NONE — audit only.

---

## P0-02: Tailwind v4 & Base UI Dry-Run Proof

**1. Tujuan**
Mempersiapkan dan membuktikan kompatibilitas CLI shadcn Base UI dengan Tailwind v4 secara terisolasi melalui dry-run. Agen wajib mengidentifikasi prefix aktual yang dihasilkan CLI, serta mencatat setiap file yang akan diubah/ditulis CLI sebelum persetujuan instalasi nyata diberikan.

**2. Lokasi file dan route/parent**
- `apps/web/`
- Output CLI terminal

**3. Official references**
- shadcn CLI Base UI documentation.
- Tailwind v4 documentation.

**4. Data source**
Not applicable — CLI dry-run only.

**5. shadcn components**
Not applicable — CLI dry-run only (khususnya command `shadcn add button --dry-run`).

**6. React Bits**
Not applicable — CLI dry-run only.

**7. Phosphor icons**
Not applicable — CLI dry-run only.

**8. Struktur visual/output**
Not applicable — CLI dry-run only. Output berupa Dry-Run Report berbentuk teks.

**9. Interaksi**
Not applicable — CLI dry-run only.

**10. State**
Not applicable — CLI dry-run only.

**11. Responsive behavior**
Not applicable — CLI dry-run only.

**12. Accessibility**
Not applicable — CLI dry-run only.

**13. Styling constraints**
- Pendekatan Tailwind v4 native (CSS-first).
- Larangan mengimpor atau mengaktifkan Preflight.

**14. Forbidden changes (Hal yang dilarang)**
- **Dilarang memodifikasi** `apps/web/src/components/ui/button.tsx`.
- **Dilarang menambahkan** library `lucide-react` atau `@radix-ui/*`.
- **Dilarang membuat** file konfigurasi Tailwind v3 (`tailwind.config.ts`, `tailwind.config.js`).
- **Dilarang mengimpor** Tailwind Preflight.
- **Commands yang BOLEH dijalankan:** `pnpm dlx shadcn@latest info`, `pnpm dlx shadcn@latest add button --dry-run`.
- **Commands yang TIDAK BOLEH dijalankan:** `shadcn init` (tanpa dry-run), `npm install`, `pnpm install`.

**15. Acceptance criteria**
Menghasilkan laporan Dry-Run yang memuat:
- Output aktual dari eksekusi `shadcn info`.
- Output aktual dari eksekusi `shadcn add button --dry-run`.
- Penentuan prefix yang dihasilkan CLI (misal: `tw:` atau `tw-`).
- Daftar eksplisit berisi setiap file yang akan dibuat atau diubah oleh CLI.
- Tidak ada instalasi dependensi, mutasi file, atau modifikasi konfigurasi (termasuk package.json/lockfile).

**16. Verification**
Merujuk ke `Verification Prompt P0-02` di `subscription-verification-prompts.md`.

**17. Files allowed to modify**
NONE — eksekusi P0-02 hanya untuk CLI dry-run. Tidak ada file aplikasi, dependency, config, atau lockfile yang boleh diubah.

---

## P0-03: Isolated shadcn Initialization Proof

**1. Tujuan**
Membuktikan command dan output aktual `shadcn init` tanpa risiko regresi pada primary working tree. Memastikan Base UI dapat dipilih secara eksplisit. Mengaudit `components.json`, dependency dan lockfile delta, serta CSS/config/source yang dibuat atau diubah. Memastikan primary working tree mematuhi "No repository mutation observed berdasarkan Git pre-check dan post-check" dengan menggunakan Git temporary worktree atau salinan repository terisolasi.

**2. Lokasi file dan route/parent**
- **Execution isolation:** Temporary Git worktree yang dibuat dari commit bersih (HEAD).
- Primary working tree: DILARANG disentuh selama eksekusi CLI.

**3. Official references**
- shadcn CLI initialization documentation.

**4. Data source**
Not applicable.

**5. shadcn components**
Hanya inisialisasi (`components.json`, utilitas, dan konfigurasi dasar). Belum ada penambahan komponen UI spesifik.

**6. React Bits**
Not applicable.

**7. Phosphor icons**
Not applicable.

**8. Struktur visual/output**
Initialization Diff Report berbentuk teks yang merinci perubahan pada temporary worktree, bukti isolation, dan status verifikasi.

**9. Interaksi**
Not applicable.

**10. State**
Not applicable.

**11. Responsive behavior**
Not applicable.

**12. Accessibility**
Not applicable.

**13. Styling constraints**
- Tidak membuat `.pl-ui-scope`.
- Tidak membuat portal root.

**14. Forbidden changes (Hal yang dilarang)**
- JANGAN menambahkan komponen (Button, Badge, Card, atau Progress).
- JANGAN membuat `.pl-ui-scope` atau portal root.
- JANGAN mengubah legacy `apps/web/src/components/ui/button.tsx`.
- JANGAN membuat `components.json` secara manual (harus dibiarkan dihasilkan oleh CLI pada temporary worktree).
- JANGAN melakukan commit di temporary atau primary worktree.
- JANGAN menerapkan (copy/merge) hasil dari temporary worktree ke primary working tree.

**15. Acceptance criteria**
- Mencatat baseline Git pada primary working tree dan status pembuatan temporary worktree (pastikan dari HEAD bersih).
- Menangkap seluruh prompt dan output CLI aktual dari `shadcn init`.
- Memastikan Base UI dapat dipilih secara eksplisit.
- Mencatat seluruh file sebelum dan sesudah eksekusi pada temporary worktree. Setiap file hasil CLI harus dicantumkan dalam Initialization Diff Report. File yang tidak diperkirakan diklasifikasikan `RISK` atau `BLOCKED`.
- Mengaudit `components.json`, delta dependency, dan delta lockfile secara komprehensif.
- Mengaudit CSS, config, dan source code yang dibuat/diubah.
- Memastikan primary working tree: No repository mutation observed berdasarkan Git pre-check dan post-check.
- Menghapus temporary worktree setelah report selesai.
- Berhenti setelah menghasilkan *initialization diff report*.

*Stop Conditions (wajib memblokir proses jika terjadi):*
- Primary working tree berubah.
- Temporary worktree dibuat dari commit yang bukan HEAD bersih.
- CLI meminta keputusan interaktif yang tidak dikunci prompt.
- Command tidak dapat memastikan opsi `--base base`.
- CLI memilih Radix, bukan Base UI.
- CLI menambahkan `lucide-react`.
- CLI mengubah legacy `components/ui/`.
- CLI membuat atau mengubah file di luar daftar yang terlihat dalam diff.
- CLI membuat `tailwind.config.*`.
- CLI mengimpor Preflight/global reset.
- CLI memasang dependency yang belum disetujui.
- Proses mencoba menyalin hasil ke primary working tree.
- Temporary worktree tidak dapat dibersihkan dengan aman.
- Initialization membutuhkan keputusan interaktif yang belum ditentukan.

**16. Verification**
Merujuk ke `Verification Prompt P0-03` di `subscription-verification-prompts.md`.

**17. Files allowed to modify**
- **Primary working tree:** NONE. Dilarang memodifikasi file apa pun.
- **Temporary worktree:** CLI boleh menghasilkan perubahan hanya untuk keperluan audit. Perubahan tidak boleh di-commit, disalin ke primary working tree, atau dianggap diterima secara otomatis.

---

## P0-04: shadcn Preset Selection and Decode Audit

**1. Tujuan**
Mencari, mendekode, dan mengaudit kandidat preset resmi dari shadcn menggunakan *opaque preset code*. Tujuan utamanya adalah mengekstrak JSON konfigurasi preset, memeriksa ikon (menolak Lucide), memisahkan argumen Base UI, dan menilai gaya visual preset (style, baseColor, theme, radius, font) agar cocok dengan panduan desain ProjectLink.

**2. Lokasi file dan route/parent**
- Terminal CLI
- Temporary Git worktree (hanya jika diperlukan secara absolut untuk command read-only)

**3. Official references**
- shadcn CLI presets documentation.
- ProjectLink UI guidelines.

**4. Data source**
Not applicable.

**5. shadcn components**
Not applicable.

**6. React Bits**
Not applicable.

**7. Phosphor icons**
- ProjectLink menggunakan Phosphor sebagai satu-satunya icon system untuk UI baru.
- Aturan icon library wajib:
  - `phosphor` → eligible untuk APPROVED CANDIDATE apabila persyaratan lain terpenuhi
  - `lucide` → REJECTED
  - icon library selain phosphor → REJECTED untuk konfigurasi final ProjectLink (tetap sah sebagai decoded evidence)
  - icon library tidak tersedia atau tidak dapat diverifikasi → BLOCKED atau NOT FOUND
- DILARANG menganggap icon library non-Phosphor dapat diganti dengan aman tanpa proof terpisah.
- DILARANG menginstal dependency icon pada P0-04.
- Dependensi Phosphor yang sudah ada di repository tidak boleh dimodifikasi.

**8. Struktur visual/output**
Matriks Keputusan (Decision Matrix) untuk masing-masing kandidat preset yang ditemukan.

**9. Interaksi**
Not applicable.

**10. State**
Not applicable.

**11. Responsive behavior**
Not applicable.

**12. Accessibility**
Not applicable.

**13. Styling constraints**
- Memerlukan preset yang tidak memaksakan *legacy conventions* (seperti `tailwind.config.js`).
- Preset harus kompatibel penuh dengan Tailwind v4 dan struktur CSS-first.

**14. Forbidden changes (Hal yang dilarang)**
- JANGAN menjalankan `shadcn init`.
- JANGAN menjalankan eksekusi yang merubah repository utama.
- JANGAN membuat `components.json`.
- JANGAN menginstal dependency (seperti Lucide, Radix, atau Phosphor baru).
- JANGAN membuat commit.
- JANGAN membuat temporary worktree yang tidak segera dibersihkan.
- JANGAN memilih preset hanya karena itu adalah *default* opsi CLI.
- JANGAN mengarang (hallucinate) preset code.
- JANGAN menggunakan preset yang tidak dapat di-decode atau diverifikasi keabsahannya (tidak resmi).
- JANGAN menguji *named preset* menggunakan `preset decode` kecuali dokumentasi CLI aktual secara eksplisit mendukungnya.

**15. Acceptance criteria**
- **Candidate Distinction & Discovery:**
  - Bedakan secara tegas antara **Named preset/style** (`nova`, `vega`, `maia`, dan nama preset lain) dengan **Official opaque preset code** (exact code yang berasal dari dokumentasi resmi atau output resmi shadcn/create, contoh: `b5owWMfJ8l`, `a2r6bw`, `bJ4FLU0`).
  - *Named preset* tidak boleh diuji menggunakan `preset decode`.
  - Izinkan HANYA *official opaque preset code* yang dicantumkan pada: dokumentasi resmi shadcn, changelog resmi shadcn, official shadcn API reference, atau output resmi shadcn/create yang diberikan pengguna.
  - Catat URL/judul sumber dan *exact code*.
- **Decode Audit:**
  - Menggunakan `shadcn preset decode <code> --json` (dengan opaque code) untuk memeriksa isi tiap kandidat.
  - Membuktikan isi preset (style, baseColor, theme, font, radius, icon library) melalui output JSON aktual.
- **Component Base Correction:**
  - `Preset code` tidak mengenkode *component base*.
  - Pemilihan *Base UI* harus dikunci secara terpisah. Preset **tidak boleh** ditolak hanya karena raw decode JSON tidak menampilkan field *component base*.
- **Execution Status & Decision Matrix:**
  P0-04 execution status: PASS | PARTIAL | BLOCKED
  Individual candidate decision: APPROVED CANDIDATE | REJECTED | BLOCKED | NOT FOUND
  
  Setiap kandidat harus menghasilkan matriks berikut:
  ```text
  Preset code: 
  Source: 
  Component base: SEPARATE PARAMETER (Future isolated initialization must explicitly use: -b base)
  Style: 
  Base color: 
  Theme: 
  Font: 
  Radius: 
  Icon library: 
  Lucide presence: 
  Phosphor compatibility: 
  Tailwind v4 compatibility: 
  Individual candidate decision: [APPROVED CANDIDATE | REJECTED | BLOCKED | NOT FOUND]
  Reason: 
  ```
- Syarat penyelesaian P0-04 (Acceptance):
  P0-04 boleh berstatus `PASS` meskipun semua kandidat `REJECTED`, selama:
  - minimal satu official opaque preset code berhasil didecode;
  - raw output tersedia;
  - seluruh properti yang tersedia telah diaudit (style, color, theme, font, radius, dan icon library);
  - setiap kandidat menerima keputusan;
  - Base UI dicatat sebagai parameter terpisah;
  - No repository mutation observed berdasarkan Git pre-check dan post-check.

**16. Verification**
Merujuk ke `Verification Prompt P0-04` di `subscription-verification-prompts.md`.

**17. Files allowed to modify**
NONE — Proses ini sepenuhnya bersifat *investigasi CLI* dan *read-only*.

---

## P0-B: Tailwind v4 Foundation, CSS Isolation, Scoped Tokens, and Portal Root

**1. Tujuan**
Menyiapkan fondasi CSS dan portal yang terisolasi untuk UI subscription baru tanpa menyebabkan regression pada navbar, homepage, atau komponen legacy.

**2. Lokasi file dan route/parent**
Kandidat awal (dokumen harus memverifikasi daftar final ini setelah audit awal):
- `apps/web/postcss.config.mjs`
- `apps/web/src/styles/shadcn.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/package.json`
- `pnpm-lock.yaml`

*(Setiap file tambahan tidak diizinkan. Frasa umum seperti 'file lain jika diperlukan' ditolak. File tambahan wajib menjadi Stop Condition untuk persetujuan.)*

**3. Official references**
- Tailwind v4 Documentation.

**4. Data source**
Not applicable.

**5. shadcn components**
Hanya fondasi CSS dan portal. Tidak ada instalasi primitive komponen pada tahap ini.

**6. React Bits**
Not applicable.

**7. Phosphor icons**
Not applicable.

**8. Struktur visual/output**
P0-B tidak membuat halaman product final.
Expected result P0-B harus berupa static and compilation proof:
- PostCSS memproses Tailwind v4;
- theme dan utilities terkompilasi;
- prefix aktual dapat dibuktikan;
- source scanning dapat dibuktikan;
- tidak ada Preflight;
- tidak ada global reset;
- `.pl-ui-scope` berisi scoped tokens;
- portal root tersedia;
- existing application build tetap berhasil.

Visual render proof ditunda ke P0-C ketika core components dibuat.

**9. Interaksi**
Not applicable.

**10. State**
Not applicable.

**11. Responsive behavior**
Not applicable.

**12. Accessibility**
Not applicable.

**13. Styling constraints**
- Tailwind theme dan utilities tanpa Preflight.
- Class Tailwind baru menggunakan prefix aktual berdasarkan syntax Tailwind v4.
- CSS legacy tetap berada di luar scope.
- Import CSS satu kali dari root layout.
- Homepage existing tidak boleh berubah secara visual.
- **.pl-ui-scope containment contract:**
  - design tokens subscription hanya didefinisikan di `.pl-ui-scope`;
  - seluruh komponen UI baru nantinya wajib berada di bawah ancestor `.pl-ui-scope`;
  - existing navbar, homepage, dan legacy UI tidak dibungkus `.pl-ui-scope`;
  - Tailwind source scanning hanya mencakup source UI baru;
  - tidak boleh menambahkan prefixed utility class ke legacy components pada P0-B;
  - jangan mengklaim seluruh generated Tailwind utility secara otomatis scoped oleh parent selector;
  - containment dibuktikan melalui token scope, source scan, dan absence of utility usage pada legacy source.

Styling contract:
```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme) prefix(tw);
@import "tailwindcss/utilities.css" layer(utilities) prefix(tw) source(none);

@source "../components/shadcn";
@source "../components/subscription";
@source "../components/prototype/product-org-billing.tsx";
```
*(Syntax final tidak boleh diasumsikan benar sebelum diverifikasi melalui Tailwind v4 aktual).*

**14. Forbidden changes (Hal yang dilarang)**
- JANGAN mengimpor Tailwind Preflight.
- JANGAN menambahkan global reset.
- JANGAN mengubah style `html`, `body`, `button`, `a`, `input`, atau heading secara global.
- Perubahan yang diizinkan pada `apps/web/src/app/layout.tsx` HANYA:
  1. import `shadcn.css` tepat satu kali;
  2. menambahkan container: `<div id="pl-ui-portal-root"></div>`.
- JANGAN membungkus seluruh aplikasi dengan `.pl-ui-scope`.
- JANGAN memindahkan navbar atau children.
- JANGAN mengubah metadata atau provider.
- JANGAN menambahkan class global pada `html` atau `body`.
- JANGAN memberikan `aria-hidden="true"` pada portal root.
- JANGAN mengubah layout structure selain penyisipan portal container yang tidak memengaruhi flow.
- JANGAN mengubah file:
  - `apps/web/src/components/ui/`
  - `apps/web/src/components/layout/`
  - navbar components
  - existing homepage components
  - subscription page
  - pricing page
  - organization billing page

*Forbidden Dependencies:*
- `lucide-react`
- `@radix-ui/*`
- icon library selain Phosphor
- Tailwind v3
- dependency tambahan yang tidak tercantum

**15. Acceptance criteria**
- Melakukan audit dependency Tailwind v4 dan PostCSS yang dibutuhkan.
- Menginstal dependency yang secara eksplisit disetujui (Allowed: `tailwindcss` v4, `@tailwindcss/postcss`).
- Base UI tidak diinstal pada P0-B. Base UI ditunda sampai execution unit interactive primitives benar-benar membutuhkannya.
- Mengonfigurasi `@tailwindcss/postcss`.
- Menyiapkan file CSS terisolasi dengan scoped design tokens.
- Mengidentifikasi prefix aktual.
- Portal root `<div id="pl-ui-portal-root"></div>` terpasang di root layout tanpa memengaruhi layout dan kompatibel dengan Dialog/Drawer.
- Regression verification navbar dan homepage berhasil (tidak ada perubahan).
- Build dan TypeScript verification berhasil.

*Stop Conditions (Wajib berhenti jika terjadi):*
- Tailwind yang terdeteksi adalah v3.
- Setup membutuhkan `tailwind.config.*`.
- CLI atau package menambahkan Preflight.
- Global element selector berubah.
- Navbar atau homepage berubah.
- Legacy `components/ui/` berubah.
- Lucide atau Radix ditambahkan.
- Prefix tidak dapat dibuktikan.
- `.pl-ui-scope` tidak dapat membatasi token.
- Portal root memengaruhi layout.
- File di luar allowed list perlu diubah.
- Build existing gagal sebelum implementasi.
- Dependency versions bertabrakan dengan workspace.

**16. Verification**
Merujuk ke `Verification Prompt P0-B` di `subscription-verification-prompts.md`.

**17. Files allowed to modify**
Hanya 5 target file yang telah diaudit:
- `apps/web/postcss.config.mjs`
- `apps/web/src/styles/shadcn.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/package.json`
- `pnpm-lock.yaml`
