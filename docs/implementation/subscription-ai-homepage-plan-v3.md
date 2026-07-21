# Implementation Plan v3 (Final) — Subscription System, AI Features & Homepage Enhancement

## Tujuan

Membangun sistem subscription, fitur AI kontekstual, dan pembaruan homepage secara bertahap di atas codebase ProjectLink BRIN — menggunakan **shadcn/ui (70%)**, **custom ProjectLink styling (20%)**, dan **React Bits (10%)**.

> [!NOTE]
> Semua path dalam dokumen ini menggunakan **path relatif terhadap root repository** untuk menghindari staleness ketika workspace berpindah lokasi.

---

## Design Decisions (Locked)

| Keputusan | Status |
|-----------|--------|
| Persona homepage ≠ subscription state | ✅ Final |
| Returning User = demo Pro Individual | ✅ Final |
| Organization Home = Organization Plan | ✅ Final |
| `/subscription` = personal only | ✅ Final |
| `/organization/[slug]/billing` = internal organization billing route | ✅ Final |
| `/plans/organization` = public org info (baru) | ✅ Final |
| AI kontekstual, bukan dashboard terpisah | ✅ Final |
| shadcn fondasi interaksi (70%) | ✅ Final |
| shadcn component base = Base UI | ✅ Final |
| shadcn namespace = `components/shadcn/` | ✅ Final |
| React Bits selektif (10%), variant TS + CSS | ✅ Final |
| Phosphor satu-satunya sistem ikon | ✅ Final |
| Tidak ada Lucide, tidak ada campuran icon weight | ✅ Final |
| Existing `PricingPage()` & `SubscriptionPage()` dimigrasikan | ✅ Final |
| Existing `components/ui/button.tsx` tidak dimodifikasi di Phase 0 | ✅ Final |
| Tailwind v4-native isolation (bukan v3) | ✅ Final |
| `components.json` dihasilkan CLI, bukan manual | ✅ Final |

---

## Open Questions — Keputusan Sementara

### Harga Prototype

```
Status: OPEN
UI menggunakan label "Prototype pricing"
Angka tidak dianggap harga final atau penawaran komersial
```

### AI Usage Limits

```
Status: OPEN
Jangan hardcode sebagai keputusan produk
Gunakan PROTOTYPE_LIMITS constant yang mudah diganti

/**
 * Prototype-only values.
 * Not approved pricing or production usage policy.
 */
const PROTOTYPE_LIMITS = {
  free: 10,
  pro: 50,
  organization: 250,
} as const;
```

Mockup Returning User menggunakan:

```
{usage.used} dari {usage.limit}
→ resolved dari PROTOTYPE_LIMITS.pro
```

Bukan hardcode `14 dari 50` di JSX. Persentase AI Usage dihitung secara dinamis (`used / limit * 100`), bukan di-hardcode.

### Dampak Downgrade

```
Status: DECIDED (rekomendasi)
- Data tidak dihapus
- Insight lama tetap dapat dibaca
- Analisis premium baru dinonaktifkan
- Fitur organisasi tidak dapat dimutasi
- Ada contextual explanation dan jalur reactivation
```

### Tailwind

```
Status: CONDITIONALLY APPROVED
Hanya jika Phase 0 berhasil tanpa navbar/global regression
```

---

## Prototype Billing Boundary

> [!CAUTION]
> ProjectLink masih static prototype. Halaman billing TIDAK boleh terlihat seperti pembayaran nyata.
>
> **Aturan:**
> - Tidak ada transaksi atau checkout nyata
> - Tidak meminta data kartu
> - Upgrade/cancel hanya mengubah session prototype
> - Invoice diberi label "Contoh invoice"
> - Harga diberi label "Prototype pricing"
> - Payment failure merupakan simulated state
> - Tidak mengirim email, charge, refund, atau renewal nyata
>
> **Banner wajib ditampilkan:**
> ```
> Mode Prototype
> Perubahan paket dan pembayaran pada halaman ini
> hanya simulasi dan tidak menghasilkan transaksi nyata.
> ```

---

## Proposed Changes

---

### Phase 0 — UI Foundation Compatibility Gate

Tailwind + shadcn adalah perubahan arsitektur paling berisiko. Phase ini memastikan instalasi terisolasi dan tidak merusak halaman existing.

#### Step 0.1 — Audit Existing Stack

```
1. Audit package.json root dan apps/web
2. Audit globals.css dan urutan import stylesheet
3. Audit alias TypeScript (tsconfig paths)
4. Audit Phosphor sudah terpasang (@phosphor-icons/react ✓)
5. Audit dependency React Bits yang sudah ada (gsap, motion ✓)
```

#### Step 0.2 — Install Tailwind v4 Secara Terisolasi

> [!WARNING]
> Jangan menggunakan pola Tailwind v3 (`tailwind.config.ts`, `corePlugins`). Tailwind v4 menggunakan pendekatan modular CSS-first.

```
1. Pasang Tailwind hanya pada apps/web
2. Gunakan @tailwindcss/postcss untuk integrasi PostCSS
3. JANGAN membuat tailwind.config.ts (kecuali audit membuktikan v3)
4. JANGAN menggunakan corePlugins (tidak didukung v4)
5. Nonaktifkan Preflight dengan tidak mengimpor preflight.css
6. Gunakan Tailwind hanya pada source shadcn dan subscription
7. Jangan memindai seluruh source legacy
```

`apps/web/src/app/shadcn.css`:

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme) prefix(tw);
@import "tailwindcss/utilities.css" layer(utilities) prefix(tw) source(none);

@source "../components/shadcn";
@source "../components/subscription";
@source "../components/prototype/product-org-billing.tsx";
```

Pola ini:
- Tidak memuat Preflight
- Membatasi pemindaian utility ke komponen baru saja
- Menjaga CSS legacy tidak terpengaruh
- Prefix syntax ditentukan setelah dry-run (bisa `tw:` atau bentuk lain)

#### Step 0.2.1 — Import Path `shadcn.css`

`shadcn.css` harus diimpor melalui **satu jalur saja**. Misalnya di Root app layout (`apps/web/src/app/layout.tsx`):
```tsx
import "./shadcn.css";
```
Jangan mengimpor dari beberapa page — menyebabkan urutan CSS tidak konsisten.

#### Step 0.2.2 — `.pl-ui-scope` Token Audit & `@theme inline`

Token audit mencakup dua lapisan:
1. Runtime semantic variables di `.pl-ui-scope`
2. Tailwind mapping melalui `@theme inline`

`.pl-ui-scope` harus berisi **seluruh token** yang dibutuhkan komponen shadcn. Minimal audit token:

```css
.pl-ui-scope {
  --background: ...;
  --foreground: ...;
  --card: ...;
  --card-foreground: ...;
  --popover: ...;
  --popover-foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  --secondary: ...;
  --secondary-foreground: ...;
  --muted: ...;
  --muted-foreground: ...;
  --accent: ...;
  --accent-foreground: ...;
  --destructive: ...;
  --border: ...;
  --input: ...;
  --ring: ...;
  --radius: 0.75rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  /* ... sisa token lainnya ... */
  --radius-lg: var(--radius);
}
```

Token scope harus lengkap agar Dialog, Card, Tooltip, Table, dan form state tidak mengambil nilai yang hilang.

#### Step 0.2.3 — Portal Scope Verification (CRITICAL)

Base UI menggunakan portal untuk komponen seperti Dialog dan Tooltip (dirender di bawah `<body>`). Portal ini bisa kehilangan token `.pl-ui-scope`.

```
1. Buat portal root khusus di root layout (apps/web/src/app/layout.tsx).
2. Portal root juga memiliki class `.pl-ui-scope`.
3. Dialog, Drawer, Tooltip, dan DropdownMenu diarahkan
   ke portal root tersebut (menggunakan prop container dari Base UI).
4. Verifikasi token warna, radius, font, dan border
   tetap tersedia saat overlay dibuka.
```

Contoh struktur konseptual:
```tsx
<body>
  <div id="app-root">
    {/* aplikasi */}
  </div>

  <div
    id="pl-ui-portal-root"
    className="pl-ui-scope"
  />
</body>
```

#### Step 0.3 — shadcn Init (Scoped, Base UI)

> [!IMPORTANT]
> **Jangan membuat `components.json` sebagai JSON minimal manual.** Biarkan CLI menghasilkan struktur lengkap, lalu sesuaikan.

Prosedur:

```
1. Jalankan shadcn init dengan Base UI secara eksplisit (--base base)
2. Biarkan CLI menghasilkan struktur components.json lengkap
   (termasuk $schema, style, rsc, tsx, iconLibrary, dll)
3. Ubah alias UI menjadi @/components/shadcn
4. Terapkan strategi prefix setelah dry-run (Step 0.3.1)
5. Jalankan shadcn info dan simpan hasil audit
6. Catat preset/style yang dihasilkan CLI
```

Perintah konseptual:

```bash
pnpm dlx shadcn@latest init --base base
pnpm dlx shadcn@latest info
```

Karena target project existing, audit setiap perubahan yang dilakukan `init` sebelum diterima. Pastikan aliases menyertakan:

```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@/components/shadcn",
    "lib": "@/lib",
    "utils": "@/lib/utils",
    "hooks": "@/hooks"
  }
}
```

> [!WARNING]
> Audit output shadcn CLI:
> - Pastikan **tidak** memasukkan `lucide-react`
> - Pastikan menggunakan **Base UI**, bukan Radix
> - Jangan mencampur Base UI dan Radix dalam komponen subscription

#### Step 0.3.1 — Prefix Dry-Run

> [!WARNING]
> Jangan mengunci format prefix sebelum dry-run. Ada perbedaan representasi antara konfigurasi CLI shadcn dan sintaks utility Tailwind v4.

```
Sebelum menambahkan komponen:

1. Jalankan pnpm dlx shadcn@latest info
2. Jalankan pnpm dlx shadcn@latest add button --dry-run
3. Periksa apakah hasil memakai tw:... atau bentuk prefix lain
4. Samakan components.json, shadcn.css, dan source component
   berdasarkan output aktual CLI
5. Jangan commit konfigurasi prefix yang belum lolos proof
```

#### Step 0.3.2 — Audit CSS Bawaan shadcn

Versi terbaru shadcn dapat menambahkan CSS utility/variant sendiri (misalnya `shadcn/tailwind.css`). Jangan otomatis mengimpor atau menghapus.

```
Setelah shadcn init:

1. Periksa apakah CLI menambahkan shadcn/tailwind.css atau serupa
2. Periksa apakah komponen proof memakai custom variant dari file tersebut
3. Jangan menghapus import tanpa memeriksa Badge, Button,
   Progress, Dialog, Drawer, Accordion, dan DropdownMenu
4. Bila tidak ingin dependency CSS runtime, gunakan shadcn eject
   dan audit hasil inline
5. Pastikan hasil eject tidak menghasilkan selector global
   yang melanggar aturan isolasi
```

#### Step 0.4 — Proof of Concept (4 Primitives, Isolated Namespace)

shadcn components masuk ke namespace terpisah. **Jangan memodifikasi `components/ui/button.tsx` existing.**

```
apps/web/src/components/shadcn/
├── button.tsx    ← shadcn Button (baru)
├── badge.tsx     ← shadcn Badge (baru)
├── card.tsx      ← shadcn Card (baru)
└── progress.tsx  ← shadcn Progress (baru)
```

Subscription menggunakan:

```tsx
import { Button } from "@/components/shadcn/button";
```

Navbar dan halaman lama tetap menggunakan `components/ui/button.tsx` existing.

Konsolidasi button lama → evaluasi **setelah** semua halaman lolos regression test. Bukan di Phase 0.

#### Step 0.5 — Navbar Regression Test

```
1. Screenshot navbar sebelum dan sesudah
2. Navigasi semua route existing → tidak ada perubahan visual
3. Console errors = 0
4. Typecheck dan build
5. Lanjutkan HANYA jika tidak ada regresi
```

#### Files Phase 0

| Action | Path | Deskripsi |
|--------|------|-----------|
| NEW | `apps/web/components.json` | shadcn config (Base UI, prefix ditentukan via dry-run) |
| NEW | `apps/web/src/app/shadcn.css` | Scoped Tailwind v4 imports + `@theme inline` |
| NEW | `apps/web/src/lib/utils.ts` | `cn()` utility |
| NEW | `apps/web/src/components/shadcn/button.tsx` | shadcn Button (isolated) |
| NEW | `apps/web/src/components/shadcn/badge.tsx` | shadcn Badge |
| NEW | `apps/web/src/components/shadcn/card.tsx` | shadcn Card |
| NEW | `apps/web/src/components/shadcn/progress.tsx` | shadcn Progress |
| NEW/MODIFY | `apps/web/postcss.config.mjs` | @tailwindcss/postcss |
| MODIFY | `apps/web/package.json` | Add Tailwind v4, @tailwindcss/postcss deps |
| MODIFY | `apps/web/src/app/layout.tsx` | Import `shadcn.css`, tambah `#pl-ui-portal-root` |

**JANGAN modifikasi di Phase 0:**

| Path | Alasan |
|------|--------|
| `apps/web/src/components/ui/button.tsx` | Dipakai navbar/shell/homepage lama |
| `apps/web/tailwind.config.ts` | Tidak dibuat untuk Tailwind v4 |

---

### Phase 1 — Subscription Domain Types & Tier Matrix

Membuat data model subscription sebagai single source of truth. Tidak ada React component dalam file data.

#### [NEW] `apps/web/src/types/domain/subscription.ts`

Tiga domain status terpisah:

```typescript
// === PERSONA (independen dari subscription) ===
type PersonaState = 'guest' | 'new' | 'returning' | 'organization';

// === SUBSCRIPTION LIFECYCLE ===
type SubscriptionPlan = 'none' | 'free' | 'pro' | 'organization' | 'enterprise';

type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'cancel_scheduled'
  | 'grace_period'
  | 'expired';

// === PAYMENT (domain terpisah) ===
type PaymentStatus =
  | 'not_applicable'   // Free plan
  | 'current'
  | 'past_due'
  | 'failed';

// === AI USAGE (domain terpisah) ===
type AIUsageStatus =
  | 'normal'
  | 'near_limit'
  | 'limit_reached';

type AIFeatureAccess = 'available' | 'limited' | 'locked';

type AIFeatureId =
  | 'explainable-matching'
  | 'project-assistant'
  | 'gap-analysis'
  | 'recommendation-history'
  | 'portfolio-insight'
  | 'organization-comparison'
  | 'decision-summary';

// === BILLING ===
type BillingCycle = 'monthly' | 'yearly';

// === COMPOSITE ===
interface AIUsage {
  used: number;
  limit: number | null;        // null = unlimited / custom
  resetAt?: string;            // ISO date
  statusOverride?: AIUsageStatus; // Hanya untuk prototype override
}

// Helper: derive status dinamis dari used/limit
function deriveAIUsageStatus(usage: AIUsage): AIUsageStatus {
  if (usage.statusOverride) {
    return usage.statusOverride;
  }
  if (usage.limit === null) {
    return "normal";
  }
  if (usage.used >= usage.limit) {
    return "limit_reached";
  }
  if (usage.used / usage.limit >= 0.8) {
    return "near_limit";
  }
  return "normal";
}

interface SubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;

  billingCycle?: BillingCycle;  // optional: Free has none
  renewalDate?: string;        // ISO date, optional
  cancelDate?: string;         // ISO date, optional

  ai: {
    usage: AIUsage;
    capabilities: AIFeatureId[];
  };

  organization?: {
    seatsUsed: number;
    seatsLimit: number;
    aiUsage: AIUsage;
  };
}
```

Format tanggal ISO di data (`2026-08-21`), konversi ke `21 Agustus 2026` hanya pada presentation layer. Nilai turunan seperti persentase AI usage dihitung di runtime (`Math.round((used/limit)*100)`), bukan disimpan.

#### Billing & Invoice Types (Ringan)

```typescript
// === INVOICE ===
type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'void';

interface PrototypeInvoice {
  id: string;
  label: 'Contoh invoice';     // prototype guard
  issuedAt: string;             // ISO date
  amount: number;
  status: InvoiceStatus;
  billingCycle: BillingCycle;
}

// === BILLING CONTACT ===
interface BillingContact {
  name: string;
  email: string;
  organization?: string;
}

// === ORGANIZATION BILLING PERMISSION ===
interface OrganizationBillingPermission {
  canViewPlan: boolean;
  canViewInvoices: boolean;
  canManageBilling: boolean;
}
```

#### [NEW] `apps/web/src/data/subscription-tiers.ts`

Tier matrix statis — **serializable keys saja, tanpa React component**:

```typescript
interface TierDefinition {
  id: SubscriptionPlan;
  label: string;
  tagline: string;
  iconKey: 'rocket' | 'sparkle' | 'buildings' | 'shield';
  features: string[];
  limitations: string[];
  pricing: {
    monthly: number | null;    // null = "Hubungi kami"
    yearly: number | null;
    label: string;             // "Prototype pricing"
  };
}

/**
 * Prototype-only values.
 * Not approved pricing or production usage policy.
 */
const PROTOTYPE_LIMITS = {
  free: 10,
  pro: 50,
  organization: 250,
} as const;
```

Icon mapping HANYA di presentation layer:

```tsx
import { RocketLaunch, Sparkle, Buildings, ShieldCheck } from "@phosphor-icons/react";

const PLAN_ICONS = {
  rocket: RocketLaunch,
  sparkle: Sparkle,
  buildings: Buildings,
  shield: ShieldCheck,
} satisfies Record<TierDefinition['iconKey'], Icon>;
```

Tambahan isi file:
- `AI_FEATURE_MATRIX`: `AIFeatureId` → `{ free, pro, org, enterprise }` access levels
- `PROTOTYPE_LIMITS`: mudah diganti, diberi JSDoc guard
- `ALLOWED_PLANS_BY_CONTEXT`: persona → plan validation

#### Persona-Plan Validation

```typescript
const ALLOWED_PLANS_BY_CONTEXT = {
  guest: ['none'],
  new: ['free'],
  returning: ['free', 'pro'],
  organization: ['organization', 'enterprise'],
} as const;

function resolveSubscriptionPlan(
  persona: PersonaState,
  requestedPlan: SubscriptionPlan | undefined,
  fallbackPlan: SubscriptionPlan,
): SubscriptionPlan {
  const allowed = ALLOWED_PLANS_BY_CONTEXT[persona];
  if (requestedPlan && (allowed as readonly string[]).includes(requestedPlan)) {
    return requestedPlan;
  }
  return fallbackPlan;
}
```

---

### Phase 2 — Canonical Fixtures & Session Override Model

#### [NEW] `apps/web/src/dummy/subscription-fixtures.ts`

File internal pendukung (BUKAN public entry point):

```
- returningUserSubscription: Pro Individual, active, usage from PROTOTYPE_LIMITS
- organizationSubscription: Org Plan, active, 8/15 seats, AI usage
- newUserSubscription: Free Core, active, usage from PROTOTYPE_LIMITS
- invoiceHistory: 3-4 dummy invoices, label "Contoh invoice"
- scenarioFixtures: near_limit, limit_reached, payment_failed, etc.
```

#### [MODIFY] `apps/web/src/dummy/registry.ts`

Hanya menambahkan re-export:

```typescript
export { subscriptionFixtures } from "./subscription-fixtures";
```

#### [MODIFY] `apps/web/src/components/prototype/prototype-app.tsx`

Perluas `DemoState` dengan **override model saja**, bukan salinan penuh:

```typescript
interface SubscriptionSessionState {
  scenarioOverride?:
    | 'default'
    | 'near_limit'
    | 'limit_reached'
    | 'payment_failed'
    | 'cancel_scheduled'
    | 'expired';

  planOverride?: SubscriptionPlan;
  aiUsageDelta?: number;       // increment/decrement dari canonical
  cancelReason?: string;
}
```

Prioritas resolusi:
1. Prototype scenarioOverride (jika ada)
2. Session mutation (aiUsageDelta, planOverride)
3. Canonical fixture dari registry

---

### Phase 3 — Halaman `/subscription` (Personal Only, Tanpa Animasi)

> [!IMPORTANT]
> **Prosedur Migrasi Existing Pages:**
> 1. Audit seluruh route yang merender `PricingPage()` dan `SubscriptionPage()` di `prototype-app.tsx`
> 2. Audit seluruh CTA yang menuju `/pricing` dan `/subscription`
> 3. Audit state dan data yang digunakan implementasi lama
> 4. Extract logic ke `product-subscription.tsx`
> 5. Pertahankan `/pricing` sebagai compatibility route
> 6. `/pricing` dan `/subscription` merender source yang sama:
>    ```tsx
>    case "/subscription":
>    case "/pricing":
>      return <ProductSubscriptionPage />;
>    ```
> 7. Jalankan direct navigation dan refresh
> 8. Baru hapus function lama dari `prototype-app.tsx`

#### Halaman `/subscription` — Fokus Personal

```
Isi:
- Current personal plan
- Free Core vs Pro Individual comparison
- AI personal usage
- Personal billing (simulated)
- Invoice personal (label "Contoh invoice")
- Cancellation / downgrade

Organization hanya teaser kecil:
"Mengelola tim atau institusi? → Lihat paket organisasi"
CTA → /plans/organization
```

Prototype billing banner wajib ditampilkan.

#### File Structure (Split Sub-Components)

```
apps/web/src/components/subscription/
├── product-subscription.tsx         ← orchestrator
├── subscription-hero.tsx
├── personal-plan-cards.tsx
├── ai-feature-preview.tsx
├── feature-comparison.tsx
├── ai-usage-meter.tsx
├── billing-lifecycle.tsx
├── upgrade-dialog.tsx
├── cancel-dialog.tsx
└── subscription-faq.tsx
```

#### Section Breakdown

```
1. Subscription Hero
   - Prototype billing banner
   - Badge paket aktif (shadcn Badge)
   - Toggle bulanan/tahunan (shadcn Tabs)
   - Phosphor: Sparkle duotone

2. Current Plan Summary
   - Status paket aktif + renewal date
   - AI usage meter (shadcn Progress)
   - Values from PROTOTYPE_LIMITS, not hardcoded

3. Pricing Cards (2 utama + 1 teaser)
   - Free Core (iconKey: 'rocket')
   - Pro Individual (iconKey: 'sparkle') ← recommended
   - Org teaser kecil (iconKey: 'buildings')
   - Enterprise link kecil
   - Harga label "Prototype pricing"

4. AI Feature Preview
   - Grid 2×2 feature cards
   - Per tier access indicator

5. Feature Comparison
   - Desktop: shadcn Table (3 kolom: fitur, Free, Pro)
   - Mobile: shadcn Accordion

6. AI Usage Explanation
   - Prinsip "AI tidak membeli ranking"
   - Transparansi confidence & limitation

7. Billing & Plan Lifecycle
   - shadcn Alert (status variants)
   - Upgrade (shadcn Dialog, mobile: Drawer)
   - Cancel (shadcn Dialog + RadioGroup)
   - Dampak downgrade (warning card)
   - Semua simulasi, tidak ada transaksi nyata

8. FAQ
   - shadcn Accordion (6-8 pertanyaan)

9. Final CTA
   - "Mulai Pro" / "Kembali ke dashboard"
```

#### [NEW] `apps/web/src/styles/product-subscription.css`

```
- .pl-subscription-hero
- .pl-prototype-billing-banner
- .pl-pricing-cards
- .pl-pricing-card, .pl-pricing-card--recommended
- .pl-feature-comparison
- .pl-billing-section
- .pl-subscription-faq
- Responsive: 1024px, 768px, 390px
```

#### [MODIFY] `apps/web/src/components/prototype/prototype-app.tsx`

```
- Route /subscription → <ProductSubscriptionPage />
- Route /pricing → <ProductSubscriptionPage /> (compatibility)
- Update generateStaticParams jika route count berubah
```

---

### Phase 4 — State: Current Plan, Limit & Billing Scenarios

#### [MODIFY] `apps/web/src/components/subscription/*.tsx`

Komponen state visual:

```
<FeatureStateIndicator />
  States: available | limited | locked | near_limit | limit_reached | payment_issue
  Setiap state: icon + label + teks + CTA (+ tooltip jika perlu)
  TIDAK hanya dibedakan warna

<AIUsageMeter />
  Values from PROTOTYPE_LIMITS, not hardcoded JSX
  Persentase dihitung dinamis (used/limit*100)
  Progress bar + angka + status label
  aria-label + aria-valuenow

<UpgradeDialog />
  Desktop: shadcn Dialog
  Mobile: shadcn Drawer
  Isi: perbandingan fitur, harga "Prototype pricing", CTA konfirmasi
  Hanya mengubah session state, tidak ada transaksi

<CancelDialog />
  shadcn Dialog + RadioGroup (alasan cancel)
  Dampak downgrade explanation + jalur reactivation
  Hanya mengubah session state

<BillingAlert />
  Variants: active (green), near_limit (amber), payment_failed (red), expired (gray)
```

---

### Phase 5 — Perbarui Returning User Home

#### [MODIFY] `apps/web/src/components/prototype/product-homepages.tsx`

Pada `ReturningUserHome()`, tambahkan area header kecil (secondary context):

```
┌─────────────────────────────────────────┐
│ ✦ Pro Individual                        │
│ Aktif hingga {renewalDate}              │
│                                         │
│ Penggunaan AI bulan ini                 │
│ ████████████░░░░░░░                     │
│ {usage.used} dari {usage.limit}         │
│                                         │
│ [Lihat penggunaan]  [Kelola paket]      │
└─────────────────────────────────────────┘
```

Values resolved dari:
```typescript
usage: {
  used: 14,                      // fixture value
  limit: PROTOTYPE_LIMITS.pro,   // 50 (dari constant)
}
```

Komponen: shadcn Badge, Progress, Button, Tooltip
Phosphor: Sparkle, Gauge, CreditCard, ArrowRight

#### [MODIFY] `apps/web/src/styles/product-experiences.css`

Tambahkan `.pl-returning-subscription-summary`.

---

### Phase 6 — Organization Home, Billing & Public Route

#### [NEW] Halaman Publik Organisasi `/plans/organization`

Ini adalah jalur publik untuk pengunjung yang ingin melihat info paket organisasi, memisahkan dari dashboard billing organisasi internal.

```
Isi:
- Info paket Organization & Enterprise
- Perbandingan fitur organisasi
- FAQ organisasi
- CTA → Mendaftar organisasi (/register?accountType=organization)
```

#### [NEW] Komponen & CSS Halaman Publik Organisasi

| Path | Deskripsi |
|------|-----------|
| `apps/web/src/components/subscription/product-organization-plans.tsx` | Halaman `/plans/organization` |
| `apps/web/src/styles/product-organization-plans.css` | Styling |

#### [MODIFY] `apps/web/src/components/prototype/product-homepages.tsx`

Pada `OrganizationHome()`, tambahkan area header:

```
┌─────────────────────────────────────────┐
│ 🏛 Nexa Research Lab                    │
│ Organization Plan                       │
│ 8 dari 15 anggota aktif                 │
│ AI usage: {dynamicPercent}%             │
│                                         │
│ [Kelola organisasi]                     │
└─────────────────────────────────────────┘
```

Akses billing berdasarkan **permission**:

```typescript
// ✅ Benar
canManageBilling === true
```

#### [NEW] `apps/web/src/components/prototype/product-org-billing.tsx`

Halaman `/organization/[slug]/billing` (implementasi baru untuk konsep page internal):

```
- Prototype billing banner (wajib)
- Organization Plan & Enterprise / Custom
- Seats (used/limit)
- Aggregate AI usage
- Billing contact
- Invoice history (shadcn Table, label "Contoh invoice")
- Permission-gated actions
- Enterprise contact CTA
```

#### [NEW] `apps/web/src/styles/product-org-billing.css`

#### [MODIFY] `apps/web/src/components/prototype/prototype-app.tsx`

Register route `/plans/organization` dan `/organization/[slug]/billing` + update `generateStaticParams`.

---

### Phase 7 — Simplifikasi Explainable Matching (Landing Page)

#### [MODIFY] `apps/web/src/components/prototype/product-homepages.tsx`

Pada `GuestHome()`, perbarui Mica visual card (prioritaskan reason > score):

```
┌─ Glassmorphism Card ────────────────────┐
│                                         │
│ Cocok untuk kebutuhan pemetaan suhu     │
│ perkotaan                               │
│                                         │
│ ─── Alasan utama ───                    │
│ 3 kebutuhan didukung oleh evidence.     │
│                                         │
│ ─── Evidence ───                        │
│ ✓ Repository pemetaan tersedia          │
│ ✓ Dokumentasi pengujian tersedia        │
│                                         │
│ ─── Gap ───                             │
│ ⚠ Kalibrasi fisik sensor belum         │
│   dibuktikan                            │
│                                         │
│ ─── Data belum tersedia ───             │
│ ? Riwayat kolaborasi sebelumnya         │
│                                         │
│ Tingkat keyakinan: Tinggi — 82%         │
│                                         │
│ [Lihat detail matching]                 │
└─────────────────────────────────────────┘
```

#### [MODIFY] `apps/web/src/styles/product-experiences.css`

Perluas glassmorphism card untuk section Reason, Evidence, Gap, Unavailable Data.

---

### Phase 8 — Landing Page: Plan Preview + Final CTA

#### [MODIFY] `apps/web/src/components/prototype/product-homepages.tsx`

Tambahkan setelah Collaboration Workflow:

**Section 8 — Plan Preview:**

```
"Mulai gratis, tingkatkan saat dibutuhkan"

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🚀 Free Core │  │ ✦ Pro        │  │ 🏛 Org       │
│              │  │ Individual   │  │              │
│ Profil       │  │ AI mendalam  │  │ Tim & search │
│ Proyek       │  │ Analitik     │  │ Pipeline     │
│ Matching     │  │ Riwayat      │  │ Reviewer     │
│ dasar        │  │ matching     │  │ workflow     │
│              │  │              │  │              │
│ [Mulai       │  │ [Lihat       │  │ [Lihat       │
│  gratis]     │  │  detail]     │  │  detail]     │
│              │  │ →/subscription │  │ →/plans/organization │
└──────────────┘  └──────────────┘  └──────────────┘

Butuh private ecosystem atau integrasi? → Lihat Enterprise.
```

**Section 9 — Final CTA:**

> [!NOTE]
> **CTA Belt (section 4)** mendorong **eksplorasi** ("Jelajahi proyek").
> **Final CTA (section 9)** mendorong **konversi** ("Mulai gratis") dan **evaluasi paket** ("Lihat paket").

```
┌────────────────────────────────────────┐
│  🔵 Blue gradient surface             │
│                                       │
│  Siap membangun identitas profesional │
│  dari pekerjaan nyata?                │
│                                       │
│  [Mulai gratis]     [Lihat paket]     │
│    → /register        → /subscription │
└────────────────────────────────────────┘
```

#### [MODIFY] `apps/web/src/styles/product-experiences.css`

```
- .pl-plan-preview-section
- .pl-plan-preview-grid (3 kolom desktop, stack mobile)
- .pl-plan-card-mini
- .pl-final-cta-section (blue gradient, berbeda dari CTA Belt)
```

---

### Phase 9 — React Bits Selective Enhancement

#### Dependency Audit Per Component (Mandatory)

Untuk setiap React Bits component, sebelum menambahkan:

```
1. Catat source component dan variant (TS + CSS, bukan Tailwind)
2. Catat dependency tambahan (jangan asumsikan motion)
3. Periksa package sudah tersedia atau belum
4. Periksa bundle impact
5. Periksa reduced motion support
6. Periksa keyboard/focus impact
7. Tambahkan HANYA setelah approval dependency
```

#### Scope Awal (3 komponen, TS + CSS variant)

```
Fade Content
→ audit source dan dependency aktual
→ gunakan TS + CSS variant

Spotlight Card
→ audit source dan dependency aktual
→ gunakan TS + CSS variant

Magic Bento
→ audit source dan dependency aktual
→ gunakan TS + CSS variant
→ hanya dipasang jika dependency tambahannya disetujui
```

Penempatan:
- Landing Page: Fade Content (Plan Preview), Spotlight Card (Explainable AI - opsional)
- Subscription Page: Fade Content (Hero), Spotlight Card (Pro Individual card), Magic Bento (AI Feature Preview grid)

---

### Phase 10 — Responsive, Accessibility, Validation & Documentation

#### Responsive Rules

```
Desktop (≥ 1024px):
  Pricing cards berdampingan (3 kolom)
  Feature comparison sebagai Table
  Upgrade sebagai Dialog

Tablet (768px–1023px):
  Pricing cards 2 kolom
  Feature comparison Table (scroll horizontal)

Mobile (≤ 767px):
  Pricing cards 1 kolom stack
  Feature comparison sebagai Accordion
  Upgrade sebagai Drawer
  Touch target minimal 44×44px
```

#### Accessibility Checklist

```
☐ Pricing tidak hanya dibedakan warna (icon + label + teks)
☐ Current plan diumumkan dengan aria-current + sr-only teks
☐ Progress bar memiliki aria-label + aria-valuenow
☐ Tooltip bukan satu-satunya sumber informasi
☐ Dialog/Drawer memiliki fokus awal yang benar
☐ Feature comparison navigable keyboard
☐ Motion mengikuti prefers-reduced-motion
☐ Escape menutup dialog dan mengembalikan fokus
```

#### Verification Plan (20 checks)

```
 1. Navbar screenshot before/after
 2. Direct navigation dan refresh /subscription
 3. Direct navigation dan refresh /organization/[slug]/billing
 4. /pricing compatibility → same page as /subscription
 5. Browser back/forward
 6. Current-plan state renders correctly
 7. Near-limit state (amber badge + progress)
 8. Limit-reached state (red badge + blocked CTA)
 9. Payment-failed state (red alert + resolution CTA)
10. Cancel-scheduled state (warning + reactivation)
11. Keyboard Dialog/Drawer navigation
12. Escape dan focus return
13. Reduced motion (prefers-reduced-motion)
14. Page-level overflow (no horizontal scroll)
15. Console errors (zero)
16. Session reset (demo state clear → defaults)
17. Permission state org billing (non-admin sees limited view)
18. Invalid persona-plan combination falls back to canonical fixture
19. Dialog, Drawer, Tooltip, dan DropdownMenu mempertahankan
    theme token di portal (.pl-ui-scope pada portal root)
20. Direct navigation dan refresh /plans/organization
    - Halaman publik terender, tidak menampilkan invoice/billing internal
    - CTA menuju /register?accountType=organization
    - Enterprise CTA tetap dalam konteks publik
```

**Route Count:**
Expected static pages sesuai route matrix terbaru (generateStaticParams).

---

## File Summary

### New Files (Phase 0)

| Path | Deskripsi |
|------|-----------|
| `apps/web/components.json` | shadcn config (Base UI, prefix ditentukan via dry-run) |
| `apps/web/src/app/shadcn.css` | Scoped Tailwind v4 imports + `@theme inline` |
| `apps/web/src/lib/utils.ts` | `cn()` utility |
| `apps/web/src/components/shadcn/button.tsx` | shadcn Button (isolated namespace) |
| `apps/web/src/components/shadcn/badge.tsx` | shadcn Badge |
| `apps/web/src/components/shadcn/card.tsx` | shadcn Card |
| `apps/web/src/components/shadcn/progress.tsx` | shadcn Progress |

### New Files (Phase 1-8)

| Path | Phase | Deskripsi |
|------|-------|-----------|
| `apps/web/src/types/domain/subscription.ts` | 1 | Domain types (3 status domains + billing) |
| `apps/web/src/data/subscription-tiers.ts` | 1 | Tier matrix, PROTOTYPE_LIMITS, validation |
| `apps/web/src/dummy/subscription-fixtures.ts` | 2 | Canonical dummy data (internal only) |
| `apps/web/src/components/subscription/product-subscription.tsx` | 3 | Orchestrator (Personal) |
| `apps/web/src/components/subscription/subscription-hero.tsx` | 3 | Hero + billing banner |
| `apps/web/src/components/subscription/personal-plan-cards.tsx` | 3 | Plan cards |
| `apps/web/src/components/subscription/ai-feature-preview.tsx` | 3 | AI features grid |
| `apps/web/src/components/subscription/feature-comparison.tsx` | 3 | Table/Accordion |
| `apps/web/src/components/subscription/ai-usage-meter.tsx` | 3-4 | Progress meter |
| `apps/web/src/components/subscription/billing-lifecycle.tsx` | 4 | Billing states |
| `apps/web/src/components/subscription/upgrade-dialog.tsx` | 4 | Upgrade flow (simulated) |
| `apps/web/src/components/subscription/cancel-dialog.tsx` | 4 | Cancel flow (simulated) |
| `apps/web/src/components/subscription/subscription-faq.tsx` | 3 | FAQ accordion |
| `apps/web/src/styles/product-subscription.css` | 3 | Subscription CSS |
| `apps/web/src/components/subscription/product-organization-plans.tsx` | 6 | Halaman `/plans/organization` (publik) |
| `apps/web/src/styles/product-organization-plans.css` | 6 | Styling `/plans/organization` |
| `apps/web/src/components/prototype/product-org-billing.tsx` | 6 | Org billing page (internal) |
| `apps/web/src/styles/product-org-billing.css` | 6 | Org billing CSS |

### Modified Files

| Path | Phase | Perubahan |
|------|-------|-----------|
| `apps/web/postcss.config.mjs` | 0 | @tailwindcss/postcss |
| `apps/web/package.json` | 0 | Tailwind v4 deps |
| `apps/web/src/app/layout.tsx` | 0 | Import `shadcn.css`, tambah `#pl-ui-portal-root` |
| `apps/web/src/dummy/registry.ts` | 2 | Re-export subscription fixtures |
| `apps/web/src/components/prototype/prototype-app.tsx` | 2,3,6 | DemoState override, routes, migration |
| `apps/web/src/components/prototype/product-homepages.tsx` | 5,6,7,8 | Homepage updates |
| `apps/web/src/styles/product-experiences.css` | 5,7,8 | Section styling |

### shadcn Components (Phase 0 → Phase 4)

| Component | Phase | Namespace | Penggunaan |
|-----------|-------|-----------|------------|
| Badge | 0 | shadcn/ | Plan labels |
| Card | 0 | shadcn/ | Pricing cards |
| Progress | 0 | shadcn/ | AI usage meter |
| Button | 0 | shadcn/ | New page CTAs only |
| Tabs | 3 | shadcn/ | Billing cycle toggle |
| Table | 3 | shadcn/ | Feature comparison (desktop) |
| Accordion | 3 | shadcn/ | Feature comparison (mobile), FAQ |
| Alert | 4 | shadcn/ | Billing status |
| Dialog | 4 | shadcn/ | Upgrade/cancel (desktop) |
| Drawer | 4 | shadcn/ | Upgrade/cancel (mobile) |
| RadioGroup | 4 | shadcn/ | Cancel reasons |
| Separator | 4 | shadcn/ | Section dividers |
| Tooltip | 5 | shadcn/ | Usage detail hover |
| DropdownMenu | 6 | shadcn/ | Org settings menu |

---

## `@source` Governance Rule

Karena automatic detection dinonaktifkan dengan `source(none)`, Tailwind hanya menghasilkan utility dari source terdaftar.

Daftar `@source` saat ini:
```css
@source "../components/shadcn";
@source "../components/subscription";
@source "../components/prototype/product-org-billing.tsx";
```

Aturan:
- `product-homepages.tsx` dan `product-organization-plans.tsx` **BOLEH** mengimpor komponen dari `components/shadcn`.
- **JANGAN** menulis utility `tw:` langsung di file tersebut.
- Jika utility `tw:` ditulis langsung, tambahkan file tersebut ke `@source`.
- (Catatan: `product-organization-plans.tsx` sudah tercakup oleh `@source "../components/subscription"`, jadi tidak perlu entry terpisah).

Ini mencegah kondisi class muncul di JSX tetapi tidak pernah di-generate oleh Tailwind.

---

## Component Prompt Governance

Untuk memastikan agen AI mengimplementasikan komponen dengan presisi tanpa menebak-nebak, setiap komponen/section **wajib memiliki Component Prompt** sebelum dieksekusi. 

Kumpulan Component Prompt akan disimpan terpisah, dengan struktur:
- `Appendix A — Component Implementation Prompts` (P0-01 hingga P9-03)
- `Appendix B — Component Verification Prompts`

### Kontrak Wajib Component Prompt
Setiap prompt harus mencakup:
1. **Tujuan**: Konteks komponen.
2. **Lokasi file** & **Route / parent page**.
3. **Official reference**: URL shadcn/React Bits/Phosphor.
4. **Data source**: Asal data yang akan di-render.
5. **Komponen shadcn**: Daftar spesifik yang dipakai (misal: Card, Button).
6. **React Bits**: Daftar spesifik yang dipakai (jika ada).
7. **Phosphor icons**: Ikon spesifik & weight-nya.
8. **Struktur visual**: Komposisi DOM (Header, Content, Footer).
9. **Interaksi**: Perilaku klik, hover, navigasi vs aksi.
10. **State**: Kondisi empty, loading, disabled, error.
11. **Responsive behavior**: Desktop vs Mobile.
12. **Accessibility**: ARIA roles, labels, keyboard navigation.
13. **Styling constraints**: Kelas `.pl-*` vs utility `tw:`.
14. **Hal yang dilarang**: Apa yang TIDAK boleh dilakukan.
15. **Acceptance criteria**: Syarat selesai.
16. **Verification**: Langkah uji spesifik.
17. **Files allowed to modify**: Batas modifikasi file.

### Aturan Eksekusi Komponen
1. **Official Docs != Copy Paste**: Dokumentasi resmi hanya untuk referensi API, composition, props, dependency, a11y, dan behavior. Tampilan visual **harus** diadaptasi ke token `.pl-ui-scope`, struktur data ProjectLink, dan aturan prototype. Jangan membuat project terlihat seperti demo template.
2. **shadcn sebagai Semantic Structure**: Gunakan komponen shadcn untuk struktur dasar yang kokoh.
3. **React Bits sebagai Visual Enhancement**: Hanya tambahkan ini setelah struktur dasar bekerja, sebagai lapisan peningkatan visual.
4. **Phosphor icon contract**: Gunakan `currentColor`, `aria-hidden` untuk ikon dekoratif. Regular untuk navigasi, Bold untuk aksi utama. Jangan import seluruh namespace ikon.
5. **Navigation Rules**: Navigasi harus menggunakan `next/link` yang diberi gaya dengan `buttonVariants()`.
   ```tsx
   // Internal route
   <Link href="/subscription" className={buttonVariants({ variant: "default" })}>...</Link>

   // External URL
   <a href="..." target="_blank" rel="noreferrer">...</a>

   // UI action
   <Button type="button">...</Button>

   // JANGAN LAKUKAN INI:
   <Button><Link href="...">...</Link></Button>
   // atau onClick router.push() untuk navigasi biasa
   ```
6. **Satu per Satu**: 
   Satu Component Prompt dikerjakan dan diverifikasi sebelum prompt berikutnya dimulai.
   Setelah Completion Report:
   - agen berhenti;
   - agen menampilkan suggested commit message;
   - commit hanya dibuat setelah instruksi eksplisit pengguna.
   
   Jangan mengeksekusi banyak Component Prompt sekaligus.

---

## AI Execution Governance

Implementation Plan v3 merupakan **source of truth yang locked**. Agen AI tidak boleh mengubah keputusan produk, hierarchy, route, subscription tier, AI scope, component base, icon system, registry architecture, navbar, atau prototype billing boundary tanpa persetujuan eksplisit pengguna.

### Dokumen Eksekusi
Sebelum mengerjakan perubahan, agen wajib membaca dan mengikuti urutan berikut:
```
AGENTS.md
→ Implementation Plan v3
→ Master Execution Guardrail
→ Component Prompt aktif
→ Existing source code
→ Official documentation
```

Dokumen wajib:
- `AGENTS.md`
- `docs/implementation/subscription-ai-homepage-plan-v3.md` (dokumen ini)
- `docs/implementation/subscription-execution-guardrail.md`
- `docs/implementation/subscription-component-prompts.md`
- `docs/implementation/subscription-verification-prompts.md`

Apabila salah satu dokumen wajib belum tersedia:
→ tandai BLOCKED
→ jangan membuat pengganti secara otomatis
→ laporkan dokumen yang belum tersedia

### One-Component Rule
Agen hanya boleh mengerjakan **satu Component Prompt ID dalam satu siklus kerja**.
Contoh:
```
P0-01
→ audit-only
→ Preflight Report
→ persetujuan pengguna
→ implementasi
→ verifikasi
→ Completion Report
→ berhenti (tunggu instruksi sebelum commit atau lanjut)
```
Agen **dilarang**:
- mengerjakan prompt berikutnya secara otomatis;
- mengerjakan seluruh phase dalam satu perubahan besar;
- memperluas scope karena dianggap lebih baik;
- melakukan refactor yang tidak diminta;
- mengubah file di luar daftar `Files Allowed to Modify`;
- memperbaiki masalah lama yang tidak menghalangi prompt aktif;
- menginstal dependency tanpa audit dan persetujuan yang diwajibkan;
- membuat commit tanpa instruksi pengguna.

### Mandatory Preflight
Setiap Component Prompt dimulai dalam mode **audit-only**. 

Pada audit-only mode, agen **boleh**:
- membaca file;
- mencari symbol atau route;
- menjalankan `git status` dan `git diff`;
- menjalankan command inspeksi yang tidak menulis file;
- membuka dokumentasi resmi;
- menjalankan CLI dengan flag `--dry-run` jika benar-benar tidak menulis file.

Agen **tidak boleh** menjalankan command yang mempunyai kemungkinan mengubah dependency, lockfile, source file, atau konfigurasi.

Sebelum mengubah file, agen wajib melaporkan:
```
Prompt aktif
Tujuan
Source of truth yang sudah dibaca
Existing implementation yang ditemukan
Files yang akan dibaca
Files yang perlu diubah
Dependency yang terlibat
Risiko utama
Acceptance criteria
Verification yang akan dijalankan
```
Pada tahap ini agen **tidak boleh**: mengubah file, menginstal dependency, menjalankan generator yang menulis file, menghapus implementation lama, atau membuat commit. Implementasi hanya boleh dimulai setelah Preflight disetujui.

### Stop Conditions
Agen wajib berhenti dan melaporkan apabila:
- repository berbeda secara material dari plan;
- file atau route yang disebut tidak ditemukan;
- diperlukan file tambahan di luar allowed scope;
- dependency baru belum disetujui;
- CLI menghasilkan Lucide atau Radix;
- perubahan berisiko memengaruhi navbar atau global CSS;
- diperlukan selector global yang dilarang;
- perubahan menciptakan source of truth kedua;
- official documentation bertentangan dengan asumsi prompt;
- acceptance criteria tidak dapat dicapai tanpa perluasan scope.

Format laporan:
```
STOPPED
Temuan: ...
Dampak: ...
File terkait: ...
Pilihan aman: ...
Keputusan yang dibutuhkan: ...
```
Agen tidak boleh menerapkan workaround diam-diam.

### Evidence-Based Completion
Agen tidak boleh hanya menyatakan pekerjaan telah selesai. Completion Report wajib menyertakan:
```
Component Prompt ID
Status: PASS / PARTIAL / BLOCKED
Perubahan yang diterapkan
Files yang berubah
Command dan verification yang dijalankan
Hasil atau exit code
Acceptance criteria
Regression check
Known limitations
Out-of-scope findings
Hal yang sengaja tidak diubah
```
Satu phase tidak boleh dinyatakan selesai apabila baru sebagian Component Prompt yang diselesaikan.

### Execution Boundary
Keberhasilan diukur dari ketepatan menyelesaikan scope aktif, bukan banyaknya file yang diubah. Saat terdapat ketidakpastian: `stop → audit → report → minta keputusan`. Jangan menebak dan jangan memperluas scope.

---

## Implementation Status

| Area | Status |
|------|--------|
| Product & UX direction | ✅ Final |
| Homepage hierarchy | ✅ Final |
| Subscription routes | ✅ Final |
| Domain model (3 status domains + billing types) | ✅ Final |
| Registry architecture (fixtures via registry.ts) | ✅ Final |
| Landing page changes | ✅ Final |
| AI hierarchy | ✅ Final |
| React Bits scope | ✅ Approved |
| React Bits dependency | ⚠️ Pending per-component audit pada Phase 9 |
| Tailwind v4-native integration | ✅ Ready for Phase 0 gate |
| shadcn namespace (components/shadcn/) | ✅ Final |
| shadcn component base (Base UI) | ✅ Final |
| Existing button.tsx untouched in Phase 0 | ✅ Final |
| Prototype billing boundary | ✅ Final |
| Persona-plan validation | ✅ Final |
| PROTOTYPE_LIMITS constants | ✅ Final |
| Prefix strategy | ⚠️ Dikunci setelah Phase 0 CLI dry-run |
| CSS import & shadcn utility audit | ⚠️ Dikunci setelah Phase 0 proof |
| `.pl-ui-scope` token completeness | ⚠️ Diaudit pada Phase 0 |
| Component Prompt Governance | ✅ Final |
| AI Execution Governance | ✅ Final |

---

## Execution Decision

```
IMPLEMENTATION PLAN V3
→ ✅ FINAL AND LOCKED SOURCE OF TRUTH

PHASE 0 TECHNICAL GATE
→ ✅ SPECIFICATION READY

COMPONENT PROMPT GOVERNANCE
→ ✅ FINAL

AI EXECUTION GOVERNANCE
→ ✅ FINAL

MASTER EXECUTION GUARDRAIL
→ 🟡 MUST EXIST BEFORE IMPLEMENTATION

ACTIVE COMPONENT PROMPT
→ 🟡 REQUIRED BEFORE EACH COMPONENT IS EXECUTED

FIRST EXECUTION UNIT
→ P0-01 AUDIT-ONLY

OVERALL
→ 🟢 READY TO PREPARE P0-01
```

