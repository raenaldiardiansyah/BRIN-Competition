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
