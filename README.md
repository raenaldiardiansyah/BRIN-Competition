# ProjectLink Monorepo

Monorepo untuk prototype ProjectLink dan backend yang akan dikembangkan.

```text
apps/
├── web/                 # Next.js frontend dan prototype UX Beta 1
└── api/                 # Backend API terpisah

packages/
└── shared/              # Type dan kontrak yang dipakai web/API

docs/                    # Seluruh keputusan dan batasan UX
scripts/                 # Build dan packaging deployment
.openai/                 # Identitas hosting
```

## Menjalankan frontend

```bash
pnpm install
pnpm dev:web
```

Frontend berjalan di `http://localhost:3000`.

## Menjalankan backend

```bash
pnpm dev:api
```

Backend awal berjalan di `http://localhost:4000`. Endpoint pemeriksaan:
`GET /health`.

## Build

```bash
pnpm build
pnpm build:api
pnpm typecheck
```

Aturan penempatan:

- Halaman dan UI: `apps/web`.
- Endpoint, service, dan integrasi backend: `apps/api`.
- Type atau kontrak lintas aplikasi: `packages/shared`.
- Jangan mengimpor kode internal web dari API atau sebaliknya.
- Mulai membaca landasan UX dari `docs/REFERENCE_INDEX.md`.
