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

## AI feature implementation decisions

### Navigation

- Satu AI Hub global berada pada `/ai`.
- Tiga MVP juga memiliki contextual entry point.
- Context project, profile, dan organization dibawa melalui query parameter.
- Seluruh entry point memakai route AI yang sama, tanpa implementasi duplikat.

### AI claim policy

- Setiap hasil AI menampilkan result, reason, evidence/source, confidence,
  data gap, limitation, dan next action.
- Klaim Innovation Profile tidak dipublikasikan otomatis.
- Pengguna dapat menerima, mengoreksi, menyembunyikan, atau menambahkan
  evidence.
- Klaim tanpa evidence tidak boleh berstatus Verified.

### Subscription mapping

- Free Core: tiga MVP dasar dan kuota terbatas.
- Pro Individual: tiga MVP lengkap, Research Gap, Novelty, Funding, dan
  Commercialization.
- Organization: Industry Matching, organization context, team analytics, dan
  shared AI usage.
- Prototype memakai simulated entitlement, limitation notice, dan upgrade CTA,
  bukan halaman mati.

### Stepper

- Stepper existing hanya direncanakan untuk Collaboration Matching.
- Proof-of-layout wajib sebelum integrasi.
- Shared API/CSS tidak boleh diubah tanpa visual review.

### Static export

- Seluruh route AI wajib masuk `generateStaticParams()` ketika route AI mulai
  dibuat.
