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
