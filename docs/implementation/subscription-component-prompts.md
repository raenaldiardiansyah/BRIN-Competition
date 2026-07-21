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
Membuktikan command dan output aktual `shadcn init` tanpa risiko regresi pada primary working tree. Memastikan Base UI dapat dipilih secara eksplisit. Mengaudit `components.json`, dependency dan lockfile delta, serta CSS/config/source yang dibuat atau diubah. Memastikan primary working tree tetap zero-mutation secara absolut dengan menggunakan Git temporary worktree atau salinan repository terisolasi.

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
- Memastikan primary working tree tetap zero-mutation.
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
