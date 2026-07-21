"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Buildings,
  Compass,
  FolderOpen,
  Handshake,
  House,
  MagnifyingGlass,
  Plus,
  SquaresFour,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import {
  DesignSystemPreview,
  GuestHome,
  NewUserHome,
  OrganizationHome,
  ReturningUserHome,
} from "./product-homepages";
import {
  ContextualSearchExperience,
  OrganizationWorkspaceExperience,
  PublicEntityExperience,
} from "./product-experiences";
import type { SearchScope } from "@/dummy/registry";
import type { SubscriptionPlan, SubscriptionSessionOverride } from "@/types/domain/subscription";
import { GlobalStatusAnnouncer } from "./accessibility";
import { SubscriptionPage } from "../subscription/subscription-page";
import { resolveSubscriptionState } from "@/dummy/subscription-fixtures";
import { 
  guestSubscription, 
  newUserSubscription, 
  returningUserSubscription, 
  organizationSubscription,
  scenarioFixtures
} from "@/dummy/subscription-fixtures";
import { ProductOrganizationPlans } from "../subscription/product-organization-plans";
import { ProductOrganizationBilling } from "./product-org-billing";

type Persona = "guest" | "new" | "returning" | "organization";
type SimulatedState = "normal" | "loading" | "empty" | "error";
type PublicSearchScope =
  | "projects"
  | "people"
  | "organizations"
  | "opportunities";

type DemoState = {
  persona: Persona;
  firstValueAchieved: boolean;
  saved: boolean;
  invitationSent: boolean;
  applicationSent: boolean;
  contributionConfirmed: boolean;
  recommendationHidden: boolean;
  notificationDone: boolean;
  plan: "Free Core" | "Pro Individual" | "Organization"; // Legacy plan, kept for backward compat
  orgRole?: "admin" | "member";
  controlsCollapsed: boolean;
  previewWidth: "fluid" | "1440" | "768" | "390";

  // Subscription overrides
  subscriptionOverrides?: SubscriptionSessionOverride;
};

type ActionLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

type NativeLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
};

/**
 * Static Sites deployments serve every prototype route as its own HTML file.
 * Native anchors deliberately avoid Next's RSC client-transition requests,
 * which are not available from the static asset worker.
 */
function Link({ href, children, ...props }: NativeLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

const defaultDemo: DemoState = {
  persona: "guest",
  firstValueAchieved: false,
  saved: false,
  invitationSent: false,
  applicationSent: false,
  contributionConfirmed: false,
  recommendationHidden: false,
  notificationDone: false,
  plan: "Free Core",
  controlsCollapsed: true,
  previewWidth: "fluid",
};

const publicSearchConfig: Record<
  PublicSearchScope,
  {
    label: string;
    icon: string;
    placeholder: string;
    filters: [string, string];
  }
> = {
  projects: {
    label: "Proyek",
    icon: "▰",
    placeholder: "Cari proyek, teknologi, masalah, atau bidang riset…",
    filters: ["Bidang", "Kesiapan"],
  },
  people: {
    label: "Orang",
    icon: "●●",
    placeholder: "Cari orang berdasarkan nama, keahlian, peran, atau institusi…",
    filters: ["Keahlian", "Lokasi"],
  },
  organizations: {
    label: "Organisasi",
    icon: "▦",
    placeholder: "Cari organisasi berdasarkan nama, fokus, sektor, atau lokasi…",
    filters: ["Sektor", "Lokasi"],
  },
  opportunities: {
    label: "Peluang",
    icon: "↔",
    placeholder: "Cari peluang berdasarkan peran, bidang, proyek, atau organisasi…",
    filters: ["Bidang", "Komitmen"],
  },
};

const publicNav: Array<{
  href: string;
  label: string;
  icon: string;
  scope?: PublicSearchScope;
}> = [
  { href: "/explore", label: "Jelajahi", icon: "◉" },
  { href: "/search?scope=projects", label: "Proyek", icon: "▰", scope: "projects" },
  { href: "/search?scope=people", label: "Orang", icon: "●●", scope: "people" },
  {
    href: "/search?scope=organizations",
    label: "Organisasi",
    icon: "▦",
    scope: "organizations",
  },
  {
    href: "/search?scope=opportunities",
    label: "Peluang",
    icon: "↔",
    scope: "opportunities",
  },
];

const sitemapGroups = [
  {
    title: "Publik",
    routes: [
      ["/", "Landing"],
      ["/explore", "Explore"],
      ["/search", "Pencarian publik"],
      ["/projects/aqua-loop", "Detail proyek publik"],
      ["/profiles/maya", "Profil publik"],
      ["/pricing", "Perbandingan paket"],
    ],
  },
  {
    title: "Autentikasi & onboarding",
    routes: [
      ["/login", "Login"],
      ["/register", "Registrasi"],
      ["/verify-email", "Verifikasi email"],
      ["/onboarding/goals", "Pilih tujuan"],
      ["/onboarding/project-source", "Tambah / impor proyek"],
      ["/onboarding/ai-review", "Koreksi hasil AI"],
      ["/onboarding/first-value", "Nilai pertama"],
    ],
  },
  {
    title: "Personal",
    routes: [
      ["/home", "Homepage personal"],
      ["/me", "Profil pribadi"],
      ["/my-projects", "Daftar proyek"],
      ["/projects/aqua-loop/manage", "Kelola proyek"],
      ["/projects/aqua-loop/contributions", "Contribution & evidence"],
      ["/discovery", "Search & discovery"],
      ["/matches/aqua-maya", "Alasan matching"],
      ["/saved", "Saved items"],
      ["/collaboration", "Collaboration Center"],
      ["/notifications", "Notification Center"],
      ["/settings/privacy", "Settings & privacy"],
      ["/subscription", "Subscription"],
    ],
  },
  {
    title: "Organisasi",
    routes: [
      ["/org/nusantara", "Homepage organisasi"],
      ["/org/nusantara/profile", "Profil organisasi"],
      ["/org/nusantara/projects", "Proyek & peluang"],
      ["/org/nusantara/search", "Talent / project search"],
      ["/org/nusantara/shortlist", "Shared shortlist"],
      ["/org/nusantara/pipeline", "Collaboration pipeline"],
      ["/org/nusantara/members", "Anggota & permission"],
      ["/org/nusantara/subscription", "Subscription organisasi"],
    ],
  },
];

const project = {
  title: "AquaLoop — Pemantauan Kualitas Air",
  status: "Pilot / pengujian",
  summary:
    "Sistem sensor dan dashboard untuk membantu laboratorium komunitas memantau kualitas air secara berkala.",
  fields: ["IoT", "Environmental Data", "Community Research"],
};

function ActionLink({
  href,
  children,
  variant = "secondary",
}: ActionLinkProps) {
  return (
    <Link className={`button ${variant}`} href={href}>
      {children}
    </Link>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function WireBox({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`wire-box ${className}`}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}

function ProjectCard({
  compact = false,
  saved,
  onSave,
}: {
  compact?: boolean;
  saved?: boolean;
  onSave?: () => void;
}) {
  return (
    <article className="card">
      <div className="card-topline">
        <Badge tone="info">{project.status}</Badge>
        <span className="muted">Diperbarui 2 hari lalu</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      {!compact ? (
        <>
          <div className="tag-row">
            {project.fields.map((field) => (
              <span className="tag" key={field}>
                {field}
              </span>
            ))}
          </div>
          <p className="evidence-line">
            <strong>3 bukti publik</strong> · 2 kontribusi dikonfirmasi · Butuh
            Data Engineer
          </p>
        </>
      ) : null}
      <div className="button-row">
        <ActionLink href="/projects/aqua-loop" variant="primary">
          Lihat proyek
        </ActionLink>
        {onSave ? (
          <button className="button secondary" onClick={onSave} type="button">
            {saved ? "Tersimpan ✓" : "Simpan"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function MatchCard({
  hidden,
  onHide,
}: {
  hidden: boolean;
  onHide: () => void;
}) {
  if (hidden) {
    return (
      <div className="inline-state">
        Rekomendasi disembunyikan. Preferensi akan disesuaikan.
        <button className="text-button" onClick={onHide} type="button">
          Batalkan
        </button>
      </div>
    );
  }

  return (
    <article className="card match-card">
      <div className="card-topline">
        <Badge tone="success">Kecocokan kuat</Badge>
        <span className="muted">Keyakinan: sedang</span>
      </div>
      <h3>Maya Pradipta · Data Engineer</h3>
      <p>
        Cocok karena pengalaman time-series sensor, kontribusi Python yang dapat
        diperiksa, dan availability 8 jam/minggu.
      </p>
      <div className="reason-grid">
        <div>
          <strong>Cocok</strong>
          <span>Python, sensor data, pilot lapangan</span>
        </div>
        <div>
          <strong>Evidence</strong>
          <span>2 repository · 1 laporan uji</span>
        </div>
        <div>
          <strong>Gap</strong>
          <span>Belum ada pengalaman LoRaWAN</span>
        </div>
      </div>
      <div className="button-row">
        <ActionLink href="/matches/aqua-maya" variant="primary">
          Lihat alasan lengkap
        </ActionLink>
        <button className="button ghost" onClick={onHide} type="button">
          Sembunyikan
        </button>
      </div>
    </article>
  );
}

function SimulatedPageState({
  state,
  onReset,
}: {
  state: SimulatedState;
  onReset: () => void;
}) {
  if (state === "normal") return null;

  const content = {
    loading: {
      title: "Menyiapkan data yang relevan…",
      text: "Kriteria, filter, dan konteks halaman tetap tersimpan.",
      action: "Batalkan simulasi",
    },
    empty: {
      title: "Belum ada data untuk konteks ini",
      text: "Perluas bidang atau tambahkan informasi agar kami dapat memberi hasil yang lebih relevan.",
      action: "Kembali ke state normal",
    },
    error: {
      title: "Data belum berhasil dimuat",
      text: "Tidak ada perubahan yang hilang. Coba kembali tanpa membuat tindakan ganda.",
      action: "Coba lagi",
    },
  }[state];

  return (
    <div className={`simulated-state ${state}`} role="status">
      <div className={state === "loading" ? "skeleton-block" : "state-icon"}>
        {state === "empty" ? "∅" : state === "error" ? "!" : ""}
      </div>
      <h2>{content.title}</h2>
      <p>{content.text}</p>
      <button className="button primary" onClick={onReset} type="button">
        {content.action}
      </button>
    </div>
  );
}

function LandingPage() {
  return (
    <>
      <section className="hero">
        <div>
          <Badge tone="info">Beta 1 · prototype alur</Badge>
          <h1>Buktikan kontribusi. Temukan kecocokan. Mulai kolaborasi.</h1>
          <p>
            Jaringan profesional berbasis proyek, evidence, dan alasan matching
            yang dapat diperiksa—bukan feed sosial atau CV panjang.
          </p>
          <div className="button-row">
            <ActionLink href="/explore" variant="primary">
              Explore projects
            </ActionLink>
            <ActionLink href="/register">Buat profil berbasis proyek</ActionLink>
          </div>
          <p className="microcopy">
            Tidak perlu akun untuk melihat proyek publik dan contoh evidence.
          </p>
        </div>
        <div className="hero-wire" aria-label="Diagram nilai produk">
          {["Proyek", "Kontribusi", "Evidence", "Matching", "Kolaborasi"].map(
            (item, index) => (
              <div key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Contoh nilai sebelum mendaftar</p>
          <h2>Lihat apa yang dapat diperiksa, bukan hanya klaim.</h2>
        </div>
        <div className="two-column">
          <ProjectCard />
          <WireBox title="Cara matching dijelaskan">
            <div className="reason-list">
              <p><strong>01</strong> Kebutuhan proyek dibandingkan dengan kontribusi.</p>
              <p><strong>02</strong> Evidence pendukung dapat dibuka.</p>
              <p><strong>03</strong> Gap dan data yang belum tersedia ditampilkan.</p>
              <p><strong>04</strong> Pengguna memilih tindakan selanjutnya.</p>
            </div>
            <ActionLink href="/matches/aqua-maya">Lihat contoh alasan</ActionLink>
          </WireBox>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Dua jalur utama</p>
          <h2>Mulai sebagai individu atau organisasi.</h2>
        </div>
        <div className="two-column">
          <WireBox title="Untuk individu">
            <p>Tampilkan proyek, cari proyek, atau temukan anggota tim.</p>
            <ActionLink href="/register?goal=personal">Mulai sebagai individu</ActionLink>
          </WireBox>
          <WireBox title="Untuk organisasi">
            <p>Cari talenta, inovasi, dan kelola shortlist bersama.</p>
            <ActionLink href="/register?goal=organization">Mulai sebagai organisasi</ActionLink>
          </WireBox>
        </div>
      </section>
    </>
  );
}

function ExplorePage({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Area publik"
        title="Explore proyek dan peluang"
        description="Hanya informasi publik atau limited preview yang ditampilkan."
        actions={<ActionLink href="/search">Cari lebih spesifik</ActionLink>}
      />
      <div className="filter-bar">
        {["Semua", "Proyek", "Orang", "Organisasi", "Peluang"].map((filter) => (
          <button className={filter === "Proyek" ? "active" : ""} key={filter}>
            {filter}
          </button>
        ))}
      </div>
      <div className="content-with-rail">
        <div className="card-list">
          <ProjectCard
            onSave={() =>
              demo.persona === "guest"
                ? undefined
                : updateDemo({ saved: !demo.saved })
            }
            saved={demo.saved}
          />
          <article className="card">
            <div className="card-topline">
              <Badge tone="warning">Limited preview</Badge>
              <span className="muted">Data sensitif disembunyikan</span>
            </div>
            <h3>Smart Materials for Low-Cost Cooling</h3>
            <p>
              Ringkasan aman tersedia. File teknis dan detail kontak memerlukan
              izin pemilik.
            </p>
            <div className="button-row">
              <ActionLink href="/projects/cooling-preview" variant="primary">
                Buka limited preview
              </ActionLink>
              <ActionLink href="/login?returnTo=/projects/cooling-preview&action=request-access">
                Minta akses
              </ActionLink>
            </div>
          </article>
          <article className="card">
            <Badge tone="neutral">Peluang publik</Badge>
            <h3>Research Pilot: Urban Heat Mapping</h3>
            <p>Kolaborasi 12 minggu · Remote/Hybrid · Organisasi terverifikasi</p>
            <ActionLink href="/opportunities/urban-heat">Lihat peluang</ActionLink>
          </article>
        </div>
        <aside className="side-panel">
          <h3>Filter dasar</h3>
          <label>Bidang<select><option>Semua bidang</option><option>Lingkungan</option></select></label>
          <label>Status<select><option>Semua status</option><option>Pilot</option></select></label>
          <label>Kolaborasi<select><option>Terbuka</option><option>Semua</option></select></label>
          <p className="microcopy">
            Matching personal tersedia setelah login dan tidak memengaruhi hasil
            organik.
          </p>
        </aside>
      </div>
    </>
  );
}

function SearchPage({
  scope,
}: {
  scope?: PublicSearchScope;
}) {
  const config = scope ? publicSearchConfig[scope] : null;

  return (
    <>
      <PageHeader
        eyebrow="Pencarian publik"
        title={config ? `Cari ${config.label.toLowerCase()}` : "Cari proyek, orang, atau organisasi"}
        description="Scope dan filter selalu terlihat agar hasil tidak terasa acak."
      />
      <div className="search-panel">
        <label className="search-input">
          <span className="sr-only">Kata kunci</span>
          <input
            defaultValue="water quality sensor"
            placeholder={config?.placeholder}
          />
        </label>
        <button className="button primary">Cari</button>
      </div>
      <div className="filter-bar">
        {config ? (
          <>
            <button className="active">{config.label} (14)</button>
            <button>{config.filters[0]}</button>
            <button>{config.filters[1]}</button>
            <button>Terbaru</button>
          </>
        ) : (
          <>
            <button className="active">Semua (14)</button>
            <button>Proyek (8)</button>
            <button>Orang (4)</button>
            <button>Organisasi (2)</button>
          </>
        )}
      </div>
      <div className="two-column">
        <ProjectCard />
        <article className="card">
          <Badge tone="success">Identity verified</Badge>
          <h3>Maya Pradipta</h3>
          <p>Data Engineer · Environmental sensing · Tersedia 8 jam/minggu</p>
          <p><strong>Evidence publik:</strong> 2 repository, 1 laporan uji</p>
          <ActionLink href="/profiles/maya" variant="primary">Lihat profil</ActionLink>
        </article>
      </div>
      <WireBox title="Contoh no-result recovery" className="subtle-box">
        <p>
          Jika hasil kosong, prototype akan mempertahankan query, menampilkan
          filter aktif, menawarkan istilah terkait, dan memberi jalur simpan
          pencarian setelah login.
        </p>
      </WireBox>
    </>
  );
}

function PublicProjectPage({
  limited,
  demo,
  updateDemo,
  router,
}: {
  limited: boolean;
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const collaborate = () => {
    if (demo.persona === "guest") {
      router.push(
        `/login?returnTo=${encodeURIComponent(
          limited ? "/projects/cooling-preview" : "/projects/aqua-loop",
        )}&action=collaborate`,
      );
      return;
    }
    router.push("/collaboration/new?project=aqua-loop");
  };

  return (
    <>
      <div className="breadcrumbs">
        <Link href="/explore">Explore</Link><span>/</span><span>Project detail</span>
      </div>
      <PageHeader
        eyebrow={limited ? "Limited preview" : "Public project"}
        title={limited ? "Smart Materials for Low-Cost Cooling" : project.title}
        description={
          limited
            ? "Pemilik membatasi detail teknis. Ringkasan aman tetap tersedia."
            : project.summary
        }
        actions={
          <>
            <button className="button primary" onClick={collaborate} type="button">
              Collaborate
            </button>
            <button
              className="button secondary"
              onClick={() =>
                demo.persona === "guest"
                  ? router.push(
                      "/login?returnTo=/projects/aqua-loop&action=save",
                    )
                  : updateDemo({ saved: !demo.saved })
              }
              type="button"
            >
              {demo.saved ? "Tersimpan ✓" : "Simpan"}
            </button>
          </>
        }
      />
      <div className="project-meta">
        <Badge tone="info">{limited ? "Access controlled" : project.status}</Badge>
        <span>Owner: Raka Wibawa</span>
        <span>Visibility: {limited ? "Limited preview" : "Public"}</span>
        <span>Last evidence check: 12 Jul 2026</span>
      </div>
      <div className="content-with-rail">
        <div className="card-list">
          <WireBox title="Masalah & hasil">
            <p>
              {limited
                ? "Material pasif untuk menurunkan temperatur bangunan. Detail formula dan hasil pengujian hanya untuk reviewer yang mendapat akses."
                : "Pengujian lapangan menunjukkan deteksi perubahan pH dapat dipantau dalam interval 15 menit pada tiga lokasi pilot."}
            </p>
          </WireBox>
          <WireBox title="Kontribusi transparan">
            <div className="table-like">
              <div><strong>Raka Wibawa</strong><span>Project Owner · Hardware integration</span><Badge tone="success">Dikonfirmasi</Badge></div>
              <div><strong>Maya Pradipta</strong><span>Data pipeline · 2025–2026</span><Badge tone="warning">Menunggu konfirmasi</Badge></div>
            </div>
            <ActionLink href="/projects/aqua-loop/contributions">Periksa contribution</ActionLink>
          </WireBox>
          <WireBox title="Evidence yang dapat diperiksa">
            {limited ? (
              <div className="locked-panel">
                <strong>3 evidence tersedia</strong>
                <p>Nama file dan detail sumber disembunyikan.</p>
                <ActionLink href="/login?returnTo=/projects/cooling-preview&action=request-access">
                  Login untuk meminta akses
                </ActionLink>
              </div>
            ) : (
              <div className="table-like">
                <div><strong>Repository sensor ingestion</strong><span>GitHub · diperiksa 12 Jul</span><Badge tone="success">Terhubung</Badge></div>
                <div><strong>Pilot test report</strong><span>PDF · sumber organisasi</span><Badge tone="info">Org confirmed</Badge></div>
                <div><strong>Field dataset v2</strong><span>Dataset · public metadata</span><Badge>Self-reported</Badge></div>
              </div>
            )}
          </WireBox>
        </div>
        <aside className="side-panel">
          <h3>Kebutuhan terbuka</h3>
          <strong>Data Engineer</strong>
          <p>Python · time-series · 8–10 jam/minggu</p>
          <p>Gap saat ini: deployment monitoring.</p>
          <button className="button primary full" onClick={collaborate}>
            {demo.applicationSent ? "Aplikasi terkirim ✓" : "Ajukan kolaborasi"}
          </button>
          <p className="microcopy">
            Login diminta saat melakukan tindakan personal; setelah login Anda
            kembali ke proyek ini.
          </p>
        </aside>
      </div>
    </>
  );
}

function PublicProfilePage({
  demo,
  router,
}: {
  demo: DemoState;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Profil publik"
        title="Maya Pradipta"
        description="Data Engineer · Environmental sensing · Bandung"
        actions={
          <button
            className="button primary"
            onClick={() =>
              demo.persona === "guest"
                ? router.push("/login?returnTo=/profiles/maya&action=invite")
                : router.push("/collaboration/new?person=maya")
            }
          >
            Invite to project
          </button>
        }
      />
      <div className="project-meta">
        <Badge tone="success">Identity verified</Badge>
        <Badge tone="info">2 contributions confirmed</Badge>
        <span>Availability: 8 jam/minggu</span>
      </div>
      <div className="two-column">
        <WireBox title="Proyek pilihan"><ProjectCard compact /></WireBox>
        <WireBox title="Contribution evidence">
          <div className="table-like">
            <div><strong>Data pipeline</strong><span>AquaLoop · outcome terukur</span><Badge tone="success">Confirmed</Badge></div>
            <div><strong>Sensor anomaly model</strong><span>RiverWatch · repository</span><Badge tone="info">Source linked</Badge></div>
          </div>
          <p className="microcopy">
            Label verifikasi bersifat spesifik; tidak semua klaim pada profil
            dianggap terverifikasi.
          </p>
        </WireBox>
      </div>
    </>
  );
}

function PricingPage() {
  const plans = [
    ["Free Core", "Satu journey inti tetap berguna", ["Profil & proyek dasar", "Contribution + evidence", "Alasan matching dasar", "Kolaborasi dalam batas wajar"]],
    ["Pro Individual", "Kedalaman dan kapasitas", ["Matching lebih rinci", "Saved search & alerts", "Analytics personal", "AI assistance lebih luas"]],
    ["Organization", "Kontrol dan kolaborasi tim", ["Seat & permission", "Shared shortlist", "Pipeline & approval", "Reporting organisasi"]],
    ["Enterprise / Custom", "Roadmap untuk kebutuhan khusus", ["SSO & API", "Custom policy", "Full audit", "SLA & integration"]],
  ] as const;
  return (
    <>
      <PageHeader
        eyebrow="Subscription"
        title="Pilih kemampuan tambahan—bukan kredibilitas tambahan"
        description="Harga, kuota, dan trial numerik belum diputuskan pada Beta 1."
      />
      <div className="pricing-grid">
        {plans.map(([name, description, features], index) => (
          <article className={`price-card ${index === 0 ? "selected" : ""}`} key={name}>
            <Badge tone={index === 0 ? "success" : "neutral"}>
              {index === 0 ? "Core tetap berguna" : index === 3 ? "Roadmap" : "Premium"}
            </Badge>
            <h2>{name}</h2>
            <p>{description}</p>
            <ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <ActionLink href={index === 0 ? "/register" : `/login?returnTo=/subscription&plan=${encodeURIComponent(name)}`} variant={index === 1 ? "primary" : "secondary"}>
              {index === 0 ? "Mulai gratis" : index === 3 ? "Diskusikan kebutuhan" : "Lihat paket"}
            </ActionLink>
          </article>
        ))}
      </div>
      <WireBox title="Tidak ada pay-to-win" className="subtle-box">
        <p>
          Paket berbayar tidak menaikkan skor matching, ranking organik, status
          verifikasi, atau prioritas pesan.
        </p>
      </WireBox>
    </>
  );
}

function AuthPage({
  mode,
  searchParams,
  updateDemo,
  router,
}: {
  mode: "login" | "register" | "verify";
  searchParams: ReturnType<typeof useSearchParams>;
  updateDemo: (next: Partial<DemoState>) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const returnTo = searchParams.get("returnTo");
  const action = searchParams.get("action");
  const hasError = searchParams.get("state") === "error";
  const submit = () => {
    updateDemo({ persona: "new" });
    const safeReturn =
      returnTo &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      ["/search", "/projects/", "/profiles/", "/organizations/", "/opportunities/", "/home", "/collaboration"].some(
        (prefix) => returnTo === prefix || returnTo.startsWith(prefix),
      )
        ? returnTo
        : null;
    if (safeReturn && action === "save-search") {
      const saved = JSON.parse(sessionStorage.getItem("projectlink-saved-searches") ?? "[]") as string[];
      sessionStorage.setItem("projectlink-saved-searches", JSON.stringify(Array.from(new Set([...saved, safeReturn]))));
      const separator = safeReturn.includes("?") ? "&" : "?";
      router.push(`${safeReturn}${separator}saved=1`);
    } else if (safeReturn) router.push(safeReturn);
    else router.push(mode === "register" ? "/onboarding/goals" : "/home");
  };

  if (mode === "verify") {
    return (
      <div className="auth-shell">
        <WireBox title="Periksa email Anda">
          <p>
            Tautan verifikasi dikirim ke <strong>maya@example.com</strong>.
            Tautan berlaku terbatas dan konteks tujuan tetap tersimpan.
          </p>
          <button className="button primary" onClick={() => router.push(returnTo || "/onboarding/goals")}>Simulasikan email terverifikasi</button>
          <button className="button ghost">Kirim ulang email</button>
        </WireBox>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <WireBox title={mode === "login" ? "Masuk" : "Buat akun"}>
        {returnTo ? (
          <div className="context-notice">
            Setelah berhasil, Anda kembali ke <strong>{returnTo}</strong>
            {action ? ` untuk melanjutkan tindakan “${action}”.` : "."}
          </div>
        ) : null}
        {hasError ? (
          <div className="error-banner" role="alert">
            Login email gagal karena kata sandi tidak sesuai. Data dan tujuan
            sebelumnya tetap tersimpan.
          </div>
        ) : null}
        <div className="auth-options">
          <button className="button secondary full" onClick={submit}>Lanjut dengan Google</button>
          <button className="button secondary full" onClick={submit}>Lanjut dengan GitHub</button>
          <div className="divider"><span>atau email</span></div>
          {mode === "register" ? <label>Nama<input placeholder="Nama lengkap" /></label> : null}
          <label>Email<input type="email" placeholder="nama@contoh.com" /></label>
          <label>Kata sandi<input type="password" placeholder="••••••••" /></label>
          {mode === "register" ? (
            <label className="check-row"><input type="checkbox" /> Saya memahami syarat dan kontrol privasi.</label>
          ) : null}
          <button className="button primary full" onClick={submit}>
            {mode === "login" ? "Masuk dengan email" : "Buat akun"}
          </button>
        </div>
        <p className="microcopy">
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link href={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Daftar" : "Masuk"}
          </Link>
          {mode === "login" ? <> · <Link href="/login?state=error">Lihat state error</Link></> : null}
        </p>
      </WireBox>
    </div>
  );
}

function OnboardingPage({
  step,
  updateDemo,
}: {
  step: string;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  const steps = ["Tujuan", "Sumber proyek", "Review AI", "Nilai pertama"];
  const current = {
    goals: 0,
    "project-source": 1,
    "ai-review": 2,
    "first-value": 3,
  }[step] ?? 0;

  const content = {
    goals: (
      <>
        <PageHeader
          eyebrow="Onboarding progresif"
          title="Apa yang ingin Anda capai lebih dulu?"
          description="Pilihan dapat diubah nanti dan tidak mengunci identitas Anda."
        />
        <div className="goal-grid">
          {[
            ["Tampilkan proyek", "Susun proyek dan bukti menjadi portofolio yang dapat diperiksa.", "/onboarding/project-source"],
            ["Cari proyek", "Temukan proyek relevan dan pahami alasan kecocokannya.", "/discovery"],
            ["Cari anggota tim", "Definisikan kebutuhan lalu periksa kandidat dan evidence.", "/onboarding/project-source"],
            ["Cari talenta / inovasi", "Gunakan konteks organisasi dan shared criteria.", "/org/nusantara"],
            ["Tawarkan peluang", "Publikasikan peluang kolaborasi yang terstruktur.", "/org/nusantara/projects"],
            ["Explore dulu", "Lewati onboarding dan mulai dari discovery.", "/explore"],
          ].map(([title, text, href]) => (
            <Link className="goal-card" href={href} key={title}>
              <span className="radio-mark" />
              <strong>{title}</strong>
              <p>{text}</p>
            </Link>
          ))}
        </div>
      </>
    ),
    "project-source": (
      <>
        <PageHeader
          eyebrow="Langkah 2"
          title="Tambahkan satu proyek untuk memperoleh nilai pertama"
          description="Anda dapat mengimpor sumber atau memulai manual. Draft disimpan."
        />
        <div className="two-column">
          <WireBox title="Impor sumber">
            <label>URL repository / dokumen<input defaultValue="https://github.com/maya/aqualoop" /></label>
            <p className="microcopy">AI hanya membuat saran dan tidak mempublikasikan otomatis.</p>
            <ActionLink href="/onboarding/ai-review" variant="primary">Impor dan tinjau</ActionLink>
          </WireBox>
          <WireBox title="Mulai manual">
            <p>Isi judul, masalah, hasil, kontribusi, dan evidence secara bertahap.</p>
            <ActionLink href="/onboarding/ai-review">Buat proyek manual</ActionLink>
            <ActionLink href="/discovery" variant="ghost">Saya belum punya proyek</ActionLink>
          </WireBox>
        </div>
      </>
    ),
    "ai-review": (
      <>
        <PageHeader
          eyebrow="Review sebelum publikasi"
          title="Periksa hasil ekstraksi AI"
          description="Setiap saran dapat diedit, dihapus, atau dikembalikan ke sumber."
        />
        <div className="content-with-rail">
          <WireBox title="Draft hasil ekstraksi">
            <label>Judul<input defaultValue={project.title} /></label>
            <label>Ringkasan<textarea defaultValue={project.summary} rows={4} /></label>
            <label>Skill yang terdeteksi<input defaultValue="Python, IoT, Time-series, Field testing" /></label>
            <div className="source-note">Sumber: README.md dan pilot-report.pdf · AI generated, belum dipublikasikan.</div>
          </WireBox>
          <aside className="side-panel">
            <h3>Pemeriksaan</h3>
            <ul className="checklist">
              <li>✓ Ringkasan dikoreksi pengguna</li>
              <li>✓ Skill dapat diedit</li>
              <li>○ Tambahkan contribution</li>
              <li>○ Pilih visibility</li>
            </ul>
            <ActionLink href="/onboarding/first-value" variant="primary">Simpan koreksi</ActionLink>
            <button className="button ghost full">Laporkan ekstraksi salah</button>
          </aside>
        </div>
      </>
    ),
    "first-value": (
      <>
        <div className="success-panel">
          <Badge tone="success">Nilai pertama tercapai</Badge>
          <h1>Proyek Anda siap diperiksa dan satu kecocokan awal ditemukan.</h1>
          <p>
            Tidak ada permintaan upgrade. Anda dapat melihat hasil terlebih
            dahulu, menambahkan evidence, atau masuk ke homepage.
          </p>
          <div className="button-row">
            <ActionLink href="/matches/aqua-maya" variant="primary">Lihat kecocokan awal</ActionLink>
            <ActionLink href="/home">Masuk homepage</ActionLink>
          </div>
        </div>
      </>
    ),
  }[step];

  useEffect(() => {
    if (step === "first-value") updateDemo({ persona: "new" });
  }, [step, updateDemo]);

  return (
    <>
      <ol className="stepper">
        {steps.map((label, index) => (
          <li className={index <= current ? "active" : ""} key={label}>
            <span>{index + 1}</span>{label}
          </li>
        ))}
      </ol>
      {content}
    </>
  );
}

function PersonalHome({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  const isNew = demo.persona === "new";
  if (isNew) {
    return (
      <>
        <PageHeader
          eyebrow="Personal home · pengguna baru"
          title="Satu langkah berikutnya untuk Anda"
          description="Tidak ada dashboard penuh angka nol."
        />
        <WireBox title="Lengkapi nilai pertama" className="focus-box">
          <div className="progress-line"><span style={{ width: "58%" }} /></div>
          <p>
            Tambahkan satu evidence agar orang lain dapat memeriksa hasil proyek
            AquaLoop.
          </p>
          <ActionLink href="/projects/aqua-loop/contributions" variant="primary">Tambah evidence</ActionLink>
        </WireBox>
        <div className="two-column section-block compact">
          <WireBox title="Proyek relevan untuk dijelajahi"><ProjectCard compact /></WireBox>
          <WireBox title="Mengapa ini ditampilkan">
            <p>Bidang environmental data cocok dengan tujuan awal Anda.</p>
            <p className="microcopy">Keyakinan masih rendah karena data profil belum cukup.</p>
            <ActionLink href="/discovery">Buka discovery</ActionLink>
          </WireBox>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Personal home · pengguna lama"
        title="Selamat datang kembali, Maya"
        description="Urutan: butuh tindakan → proyek aktif → matching → peluang."
      />
      <WireBox title="Butuh tindakan · 2" className="attention-box">
        <div className="action-item">
          <div><Badge tone="warning">Konfirmasi</Badge><strong>Konfirmasi kontribusi pada AquaLoop</strong><span>Raka meminta konfirmasi outcome data pipeline.</span></div>
          <ActionLink href="/projects/aqua-loop/contributions">Tinjau</ActionLink>
        </div>
        <div className="action-item">
          <div><Badge tone="info">Undangan</Badge><strong>Undangan pilot dari Nusantara Labs</strong><span>Balas sebelum 25 Jul · tidak ada urgensi palsu.</span></div>
          <ActionLink href="/collaboration">Buka</ActionLink>
        </div>
      </WireBox>
      <div className="section-block compact">
        <div className="section-heading"><h2>Proyek aktif</h2></div>
        <ProjectCard compact />
      </div>
      <div className="section-block compact">
        <div className="section-heading"><h2>Matching relevan</h2></div>
        <MatchCard hidden={demo.recommendationHidden} onHide={() => updateDemo({ recommendationHidden: !demo.recommendationHidden })} />
      </div>
    </>
  );
}

function MyProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Profil pribadi"
        title="Maya Pradipta"
        description="Profil ringkas berbasis proyek, contribution, dan evidence."
        actions={<ActionLink href="/profiles/maya">Lihat versi publik</ActionLink>}
      />
      <div className="content-with-rail">
        <div className="card-list">
          <WireBox title="Identitas & intent">
            <label>Headline<input defaultValue="Data Engineer · Environmental sensing" /></label>
            <label>Tujuan aktif<select defaultValue="find-project"><option value="find-project">Mencari proyek</option><option>Menampilkan proyek</option></select></label>
            <label>Availability<input defaultValue="8 jam/minggu" /></label>
          </WireBox>
          <WireBox title="Proyek & contribution pilihan">
            <ProjectCard compact />
          </WireBox>
        </div>
        <aside className="side-panel">
          <h3>Visibility ringkas</h3>
          <p>Profil: Publik</p>
          <p>Availability: Publik</p>
          <p>Kontak: Privat</p>
          <ActionLink href="/settings/privacy">Atur privacy</ActionLink>
        </aside>
      </div>
    </>
  );
}

function MyProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="My projects"
        title="Proyek dan kontribusi"
        description="Ownership dibedakan dari kontribusi."
        actions={<ActionLink href="/onboarding/project-source" variant="primary">Tambah proyek</ActionLink>}
      />
      <div className="filter-bar">
        <button className="active">Owned (1)</button>
        <button>Contributing (2)</button>
        <button>Drafts (1)</button>
        <button>Invitations (1)</button>
        <button>Archived</button>
      </div>
      <ProjectCard />
      <article className="card dashed-card">
        <Badge tone="warning">Draft tersimpan</Badge>
        <h3>Community Sensor Toolkit</h3>
        <p>Terakhir diedit 18 Jul · belum dipublikasikan.</p>
        <ActionLink href="/onboarding/ai-review">Lanjutkan draft</ActionLink>
      </article>
    </>
  );
}

function ManageProjectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Project space"
        title={project.title}
        description="Kelola overview tanpa mengaburkan ownership dan attribution."
        actions={<ActionLink href="/projects/aqua-loop">Lihat halaman publik</ActionLink>}
      />
      <div className="project-tabs">
        {[
          ["Overview", "/projects/aqua-loop/manage"],
          ["Contributions", "/projects/aqua-loop/contributions"],
          ["Evidence", "/projects/aqua-loop/contributions#evidence"],
          ["Members", "/projects/aqua-loop/manage#members"],
          ["Needs", "/projects/aqua-loop/manage#needs"],
          ["Visibility", "/settings/privacy"],
        ].map(([label, href], index) => (
          <Link className={index === 0 ? "active" : ""} href={href} key={label}>{label}</Link>
        ))}
      </div>
      <div className="content-with-rail">
        <WireBox title="Overview">
          <label>Judul<input defaultValue={project.title} /></label>
          <label>Masalah<textarea defaultValue="Laboratorium komunitas kesulitan memantau perubahan kualitas air secara berkala." rows={3} /></label>
          <label>Hasil<textarea defaultValue="Pilot tiga lokasi dengan pembacaan setiap 15 menit." rows={3} /></label>
          <button className="button primary">Simpan perubahan</button>
          <span className="save-status">Draft tersimpan otomatis</span>
        </WireBox>
        <aside className="side-panel">
          <h3>Status & readiness</h3>
          <select defaultValue="pilot"><option value="pilot">Pilot / pengujian</option><option>Prototype</option></select>
          <p><Badge>Self-reported</Badge></p>
          <p className="microcopy">Status belum dikonfirmasi organisasi.</p>
          <h3 id="members">Ownership</h3>
          <p>Milik personal · Maya Pradipta</p>
          <button className="button ghost full">Tinjau transfer ke organisasi</button>
        </aside>
      </div>
    </>
  );
}

function ContributionsPage({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Transparent contribution"
        title="Contribution & evidence"
        description="Keanggotaan proyek tidak otomatis berarti kontribusi terverifikasi."
      />
      <div className="table-card">
        <div className="table-head"><span>Kontributor</span><span>Peran & hasil</span><span>Evidence</span><span>Status</span><span>Aksi</span></div>
        <div className="table-row">
          <span><strong>Maya Pradipta</strong><small>Jan–Jul 2026</small></span>
          <span>Data pipeline<small>Monitoring interval turun menjadi 15 menit</small></span>
          <span>Repository + laporan uji</span>
          <span><Badge tone={demo.contributionConfirmed ? "success" : "warning"}>{demo.contributionConfirmed ? "Dikonfirmasi" : "Menunggu konfirmasi"}</Badge></span>
          <span><button className="button secondary" onClick={() => updateDemo({ contributionConfirmed: true })}>{demo.contributionConfirmed ? "Selesai ✓" : "Konfirmasi"}</button></span>
        </div>
        <div className="table-row">
          <span><strong>Raka Wibawa</strong><small>2025–sekarang</small></span>
          <span>Hardware integration<small>3 node sensor aktif</small></span>
          <span>Prototype + field log</span>
          <span><Badge tone="success">Dikonfirmasi owner</Badge></span>
          <span><button className="button ghost">Lihat histori</button></span>
        </div>
      </div>
      <WireBox title="Evidence" className="section-block compact">
        <div className="evidence-grid">
          {[
            ["Repository sensor ingestion", "GitHub · source linked", "Terhubung"],
            ["Pilot test report", "PDF · organization source", "Org confirmed"],
            ["Field dataset v2", "Dataset · last checked 12 Jul", "Self-reported"],
          ].map(([title, source, status]) => (
            <article className="evidence-card" key={title}>
              <div className="file-placeholder">FILE</div>
              <strong>{title}</strong><span>{source}</span><Badge>{status}</Badge>
              <button className="button secondary">View evidence</button>
            </article>
          ))}
        </div>
      </WireBox>
    </>
  );
}

function DiscoveryPage({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Search & discovery"
        title="Temukan proyek yang dapat Anda tindak lanjuti"
        description="Search untuk kebutuhan spesifik; discovery untuk rekomendasi yang belum dicari."
        actions={<ActionLink href="/saved">Saved items</ActionLink>}
      />
      <div className="search-panel">
        <input defaultValue="Environmental sensing" aria-label="Search" />
        <button className="button primary">Cari</button>
      </div>
      <div className="project-tabs">
        <button className="active">Recommended</button>
        <button>Projects</button>
        <button>People</button>
        <button>Opportunities</button>
        <button>My organization</button>
      </div>
      <MatchCard hidden={demo.recommendationHidden} onHide={() => updateDemo({ recommendationHidden: !demo.recommendationHidden })} />
      <ProjectCard saved={demo.saved} onSave={() => updateDemo({ saved: !demo.saved })} />
    </>
  );
}

function MatchDetailPage() {
  return (
    <>
      <PageHeader
        eyebrow="Explainable matching"
        title="Mengapa Maya cocok untuk AquaLoop?"
        description="Skor bukan kebenaran mutlak. Periksa alasan, evidence, gap, dan data yang belum tersedia."
        actions={<ActionLink href="/collaboration/new?person=maya&project=aqua-loop" variant="primary">Invite to project</ActionLink>}
      />
      <div className="confidence-strip">
        <div><strong>Keyakinan: sedang</strong><span>Cukup data untuk rekomendasi awal; belum cukup untuk keputusan final.</span></div>
        <div className="confidence-meter"><span style={{ width: "68%" }} /></div>
      </div>
      <div className="match-detail-grid">
        <WireBox title="Alasan kecocokan">
          <ul className="reason-bullets">
            <li><strong>Python & time-series</strong><span>Dibuktikan melalui 2 repository publik.</span></li>
            <li><strong>Environmental sensing</strong><span>Kontribusi terkonfirmasi pada RiverWatch.</span></li>
            <li><strong>Availability selaras</strong><span>8 jam/minggu; proyek membutuhkan 8–10 jam.</span></li>
          </ul>
        </WireBox>
        <WireBox title="Evidence pendukung">
          <div className="table-like">
            <div><strong>RiverWatch pipeline</strong><span>Repository · source linked</span><ActionLink href="/profiles/maya">Buka</ActionLink></div>
            <div><strong>Field anomaly report</strong><span>Organization confirmed</span><button className="button secondary">View evidence</button></div>
          </div>
        </WireBox>
        <WireBox title="Gap & keterbatasan">
          <ul>
            <li>Belum ada evidence penggunaan LoRaWAN.</li>
            <li>Availability dilaporkan pengguna, belum dikonfirmasi.</li>
            <li>Data proyek privat tidak digunakan.</li>
          </ul>
          <button className="button ghost">Berikan feedback pada hasil</button>
        </WireBox>
        <WireBox title="Tindakan berikutnya">
          <p>Kirim undangan terstruktur dengan konteks proyek, peran, ekspektasi, dan tenggat.</p>
          <ActionLink href="/collaboration/new?person=maya&project=aqua-loop" variant="primary">Invite to project</ActionLink>
        </WireBox>
      </div>
      <div className="premium-note">
        <div><Badge tone="info">Pro preview</Badge><strong>Bandingkan hingga 3 kandidat dan simpan kriteria</strong><span>Premium menambah kedalaman, bukan menaikkan skor.</span></div>
        <ActionLink href="/subscription">Lihat kemampuan Pro</ActionLink>
      </div>
    </>
  );
}

function SavedPage({ demo }: { demo: DemoState }) {
  return (
    <>
      <PageHeader eyebrow="Personal workspace" title="Saved items" description="Proyek, orang, peluang, dan pencarian tersimpan." />
      <div className="filter-bar"><button className="active">Projects</button><button>People</button><button>Opportunities</button><button>Searches</button></div>
      {demo.saved ? <ProjectCard compact /> : (
        <div className="simulated-state empty">
          <div className="state-icon">∅</div>
          <h2>Belum ada proyek tersimpan</h2>
          <p>Simpan proyek untuk membandingkan dan menindaklanjutinya nanti.</p>
          <ActionLink href="/explore" variant="primary">Explore projects</ActionLink>
        </div>
      )}
    </>
  );
}

function CollaborationPage({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Collaboration Center"
        title="Permintaan dan tindak lanjut"
        description="Undangan, aplikasi, offer, dan request information—bukan inbox promosi."
      />
      <div className="filter-bar">
        <button className="active">Action required (2)</button><button>Sent</button><button>Active</button><button>Closed</button>
      </div>
      <div className="request-list">
        <article className="request-card">
          <div><Badge tone="warning">Action required</Badge><h3>Undangan pilot dari Nusantara Labs</h3><p>Research Pilot · Urban Heat Mapping · balas sebelum 25 Jul</p></div>
          <div className="button-row"><button className="button primary" onClick={() => updateDemo({ applicationSent: true })}>{demo.applicationSent ? "Diterima ✓" : "Terima"}</button><button className="button secondary">Minta detail</button><button className="button ghost">Tolak</button></div>
        </article>
        <article className="request-card">
          <div><Badge tone="info">Contribution confirmation</Badge><h3>Konfirmasi outcome AquaLoop</h3><p>Periksa role, hasil, periode, dan evidence sebelum mengonfirmasi.</p></div>
          <ActionLink href="/projects/aqua-loop/contributions">Tinjau contribution</ActionLink>
        </article>
        {demo.invitationSent ? (
          <article className="request-card">
            <div><Badge tone="success">Terkirim</Badge><h3>Undangan untuk Maya Pradipta</h3><p>Data Engineer · AquaLoop · menunggu respons</p></div>
            <button className="button secondary">Lihat status</button>
          </article>
        ) : null}
      </div>
    </>
  );
}

function CollaborationForm({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  return (
    <>
      <div className="breadcrumbs"><Link href="/collaboration">Collaboration</Link><span>/</span><span>New request</span></div>
      <PageHeader
        eyebrow="Structured collaboration"
        title="Undang Maya ke AquaLoop"
        description="Konteks wajib membantu mencegah spam dan permintaan tanpa tujuan."
      />
      <div className="form-layout">
        <WireBox title="Detail undangan">
          <label>Jenis permintaan<select><option>Project invitation</option><option>Request for information</option><option>Collaboration offer</option></select></label>
          <label>Proyek<select><option>AquaLoop — Pemantauan Kualitas Air</option></select></label>
          <label>Peran / kebutuhan<input defaultValue="Data Engineer" /></label>
          <label>Alasan mengundang<textarea rows={4} defaultValue="Pengalaman time-series dan environmental sensing Anda relevan dengan kebutuhan pipeline pilot kami." /></label>
          <div className="two-inputs">
            <label>Komitmen<input defaultValue="8–10 jam/minggu" /></label>
            <label>Tenggat respons<input type="date" defaultValue="2026-07-25" /></label>
          </div>
          <button className="button primary" onClick={() => updateDemo({ invitationSent: true })} disabled={demo.invitationSent}>
            {demo.invitationSent ? "Undangan sudah terkirim ✓" : "Kirim undangan"}
          </button>
        </WireBox>
        <aside className="side-panel">
          <h3>Sebelum mengirim</h3>
          <ul className="checklist">
            <li>✓ Proyek terkait</li><li>✓ Peran dan ekspektasi</li><li>✓ Alasan personal</li><li>✓ Tenggat</li>
          </ul>
          <p className="microcopy">Undangan ganda akan dideteksi dan diarahkan ke thread yang sudah ada.</p>
          {demo.invitationSent ? <ActionLink href="/collaboration">Lihat status permintaan</ActionLink> : null}
        </aside>
      </div>
    </>
  );
}

function NotificationsPage({
  demo,
  updateDemo,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  return (
    <>
      <PageHeader eyebrow="Notification Center" title="Notifikasi berdasarkan prioritas" description="Security dan action required tidak bercampur dengan rekomendasi." />
      <div className="project-tabs"><button className="active">Action required</button><button>Updates</button><button>Recommendations</button><button>System</button></div>
      <div className="notification-list">
        {!demo.notificationDone ? (
          <article className="notification unread">
            <span className="priority-dot" />
            <div><Badge tone="warning">Action required</Badge><h3>Konfirmasi contribution AquaLoop</h3><p>Periksa klaim outcome dan evidence yang terhubung.</p></div>
            <button className="button secondary" onClick={() => updateDemo({ notificationDone: true })}>Tandai selesai</button>
          </article>
        ) : (
          <div className="inline-state">Notifikasi ditandai selesai dan badge diperbarui.</div>
        )}
        <article className="notification">
          <span className="priority-dot quiet" />
          <div><Badge>Recommendation</Badge><h3>3 proyek environmental data baru</h3><p>Ditampilkan karena bidang yang Anda ikuti.</p></div>
          <button className="button ghost">Sembunyikan sejenis</button>
        </article>
      </div>
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Privacy & visibility" description="Kontrol data publik, AI usage, connected sources, dan access scope." />
      <div className="settings-layout">
        <nav className="settings-nav">
          {["Account", "Privacy & visibility", "Notifications", "Connected accounts", "Security", "Data export"].map((item, index) => <button className={index === 1 ? "active" : ""} key={item}>{item}</button>)}
        </nav>
        <div className="card-list">
          <WireBox title="Profil publik">
            <div className="setting-row"><div><strong>Profile visibility</strong><span>Siapa yang dapat melihat profil.</span></div><select defaultValue="public"><option value="public">Publik</option><option>Link only</option><option>Private</option></select></div>
            <div className="setting-row"><div><strong>Contact details</strong><span>Email tidak pernah tampil publik.</span></div><select><option>Private</option><option>Selected users</option></select></div>
          </WireBox>
          <WireBox title="AI & matching">
            <div className="setting-row"><div><strong>Gunakan data publik untuk matching</strong><span>Data privat tidak digunakan untuk rekomendasi eksternal.</span></div><input type="checkbox" defaultChecked /></div>
            <div className="setting-row"><div><strong>AI project assistance</strong><span>Saran selalu perlu ditinjau sebelum publikasi.</span></div><input type="checkbox" defaultChecked /></div>
          </WireBox>
          <WireBox title="Data & recovery">
            <button className="button secondary">Export data</button>
            <button className="button ghost">Deactivate account</button>
            <p className="microcopy">Tindakan destruktif akan menampilkan impact preview dan tidak menghapus contribution history secara diam-diam.</p>
          </WireBox>
        </div>
      </div>
    </>
  );
}

// Internal SubscriptionPage replaced by external Phase 3 component

function OrganizationPage({
  section,
  demo,
  updateDemo,
}: {
  section: string;
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
}) {
  if (section === "profile") {
    return (
      <>
        <PageHeader eyebrow="Organization profile" title="Nusantara Labs" description="Applied research · Climate resilience · Bandung" actions={<button className="button secondary">Edit organization profile</button>} />
        <div className="project-meta"><Badge tone="success">Organization verified</Badge><span>Plan: Organization</span><span>Public collaboration policy</span></div>
        <div className="two-column"><WireBox title="Tentang"><p>Laboratorium terapan yang menghubungkan riset lingkungan, pilot industri, dan komunitas.</p></WireBox><WireBox title="Trust scope"><p>Identitas organisasi terverifikasi. Kontribusi dan project status tetap memiliki label terpisah.</p></WireBox></div>
      </>
    );
  }
  if (section === "projects") {
    return (
      <>
        <PageHeader eyebrow="Organization projects" title="Proyek & peluang" description="Owned, partnered, public, private, dan archived dipisahkan." actions={<button className="button primary">Buat peluang</button>} />
        <div className="filter-bar"><button className="active">Active</button><button>Opportunities</button><button>Private</button><button>Partnered</button><button>Archived</button></div>
        <ProjectCard />
        <article className="card"><Badge tone="info">Open opportunity</Badge><h3>Urban Heat Mapping Research Pilot</h3><p>4 applications · 2 perlu ditinjau · Owner: Dimas K.</p><ActionLink href="/org/nusantara/pipeline">Buka applications</ActionLink></article>
      </>
    );
  }
  if (section === "search") {
    return (
      <>
        <PageHeader eyebrow="Organization search" title="Cari talenta atau proyek" description="Pencarian menggunakan shared criteria organisasi." actions={<ActionLink href="/org/nusantara/shortlist">Shared shortlist</ActionLink>} />
        <div className="search-panel"><input defaultValue="Data engineer environmental sensing" /><button className="button primary">Cari</button></div>
        <MatchCard hidden={demo.recommendationHidden} onHide={() => updateDemo({ recommendationHidden: !demo.recommendationHidden })} />
      </>
    );
  }
  if (section === "shortlist") {
    return (
      <>
        <PageHeader eyebrow="Shared workspace" title="Shortlist: Urban Heat Pilot" description="Catatan, status, owner, dan perbandingan dapat dilihat tim." actions={<ActionLink href="/org/nusantara/search">Tambah kandidat</ActionLink>} />
        <div className="table-card"><div className="table-head"><span>Kandidat</span><span>Reason</span><span>Owner</span><span>Status</span><span>Aksi</span></div><div className="table-row"><span><strong>Maya Pradipta</strong><small>Data Engineer</small></span><span>3 kebutuhan cocok · 1 gap</span><span>Dimas K.</span><span><Badge tone="warning">Reviewing</Badge></span><span><ActionLink href="/matches/aqua-maya">Compare</ActionLink></span></div></div>
        <div className="premium-note"><div><Badge tone="info">Organization</Badge><strong>Shared shortlist adalah kontrol tim</strong><span>Tidak memengaruhi ranking organik kandidat.</span></div></div>
      </>
    );
  }
  if (section === "pipeline") {
    const columns = [["Discovered", "2"], ["Reviewing", "3"], ["Contacted", "1"], ["Waiting", "2"], ["Accepted", "1"]];
    return (
      <>
        <PageHeader eyebrow="Collaboration pipeline" title="Pipeline kolaborasi" description="Workflow ringan, bukan CRM penuh." />
        <div className="pipeline-board">
          {columns.map(([name, count], index) => (
            <section className="pipeline-column" key={name}><header><strong>{name}</strong><Badge>{count}</Badge></header>{index < 3 ? <article className="mini-card"><strong>{index === 0 ? "RiverWatch Project" : index === 1 ? "Maya Pradipta" : "AquaLoop partnership"}</strong><span>Owner: Dimas K.</span><span>Updated 2d ago</span></article> : <div className="empty-slot">Belum ada item</div>}</section>
          ))}
        </div>
      </>
    );
  }
  if (section === "members") {
    return (
      <>
        <PageHeader eyebrow="Members & permission" title="Anggota organisasi" description="Role mengikuti least privilege; billing tidak membuka proyek privat." actions={<button className="button primary">Undang anggota</button>} />
        <div className="table-card"><div className="table-head"><span>Anggota</span><span>Role</span><span>Scope</span><span>Status</span><span>Aksi</span></div>{[["Ayu Rahman","Organization Owner","All workspace"],["Dimas K.","Project Manager","2 assigned projects"],["Nadia Putri","Scout / Recruiter","Search + shortlist"],["Bagus A.","Billing Admin","Billing only"]].map(([name,role,scope])=><div className="table-row" key={name}><span><strong>{name}</strong></span><span>{role}</span><span>{scope}</span><span><Badge tone="success">Active</Badge></span><span><button className="button ghost">Edit role</button></span></div>)}</div>
        <WireBox title="Ownership guardrail" className="subtle-box"><p>Akun personal dan kontribusi tetap milik pengguna. Organisasi dapat mencabut akses workspace, bukan menghapus identitas personal.</p></WireBox>
      </>
    );
  }
  return (
    <>
      <PageHeader
        eyebrow="Organization home · Nusantara Labs"
        title="3 hal membutuhkan tindakan tim"
        description="Approval dan aplikasi muncul sebelum statistik."
        actions={<ActionLink href="/home">Switch to personal</ActionLink>}
      />
      <WireBox title="Butuh tindakan · 3" className="attention-box">
        <div className="action-item"><div><Badge tone="warning">Approval</Badge><strong>1 collaboration offer menunggu persetujuan</strong><span>Urban Heat Mapping · owner: Dimas K.</span></div><ActionLink href="/org/nusantara/pipeline">Tinjau</ActionLink></div>
        <div className="action-item"><div><Badge tone="info">Applications</Badge><strong>2 aplikasi baru untuk Data Engineer</strong><span>Evidence tersedia untuk diperiksa.</span></div><ActionLink href="/org/nusantara/shortlist">Buka shortlist</ActionLink></div>
        <div className="action-item"><div><Badge>Permission</Badge><strong>1 undangan anggota belum memiliki role</strong><span>Least privilege perlu ditentukan.</span></div><ActionLink href="/org/nusantara/members">Atur role</ActionLink></div>
      </WireBox>
      <div className="two-column section-block compact">
        <WireBox title="Proyek aktif"><ProjectCard compact /></WireBox>
        <WireBox title="Pipeline ringkas"><div className="metric-row"><span>Reviewing<strong>3</strong></span><span>Waiting<strong>2</strong></span><span>Accepted<strong>1</strong></span></div><ActionLink href="/org/nusantara/pipeline">Buka pipeline</ActionLink></WireBox>
      </div>
    </>
  );
}

function PrototypeMapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Prototype documentation"
        title="Sitemap, alur, dan keputusan Beta 1"
        description="Seluruh route di bawah dapat diklik."
      />
      <div className="sitemap-grid">
        {sitemapGroups.map((group) => (
          <WireBox title={group.title} key={group.title}>
            <div className="route-list">
              {group.routes.map(([href, label]) => (
                <Link href={href} key={href}><strong>{label}</strong><code>{href}</code></Link>
              ))}
            </div>
          </WireBox>
        ))}
      </div>
      <WireBox title="User flow utama" className="section-block compact">
        <div className="flow-line">
          {["Landing", "Explore", "Project", "Auth", "Goal", "Onboarding", "First value", "Home", "Matching", "Evidence", "Collaboration", "Status"].map((item, index) => <span key={item}><small>{index + 1}</small>{item}</span>)}
        </div>
      </WireBox>
      <div className="two-column">
        <WireBox title="Keputusan yang sudah diterapkan">
          <ul>
            <li>Homepage task-first, bukan feed sosial.</li>
            <li>Auth muncul setelah tindakan personal dan menyimpan return URL.</li>
            <li>Project, contribution, evidence, matching, dan collaboration saling terhubung.</li>
            <li>Free Core menyelesaikan journey inti.</li>
            <li>Premium menambah depth, scale, automation, dan team control.</li>
            <li>Personal dan organization context selalu terlihat.</li>
          </ul>
        </WireBox>
        <WireBox title="Keputusan yang masih terbuka">
          <ul>
            <li>Nama produk dan identitas visual final.</li>
            <li>Harga, kuota numerik, trial, dan student plan.</li>
            <li>Skala verifikasi manual dan kebijakan refund.</li>
            <li>Promoted opportunities dan batas fitur enterprise.</li>
            <li>Detail copy legal, moderation, dan support escalation.</li>
            <li>Hasil usability testing untuk jumlah langkah onboarding.</li>
          </ul>
        </WireBox>
      </div>
    </>
  );
}

function NotFoundPage() {
  return (
    <div className="simulated-state empty">
      <div className="state-icon">404</div>
      <h1>Halaman prototype belum tersedia</h1>
      <p>Route ini belum termasuk scope Beta 1. Konteks Anda tidak berubah.</p>
      <ActionLink href="/prototype-map" variant="primary">Buka sitemap prototype</ActionLink>
    </div>
  );
}

function CompatibilityRoutePage({ canonical }: { canonical: string }) {
  useEffect(() => {
    window.location.replace(canonical);
  }, [canonical]);
  return (
    <div className="simulated-state loading">
      <div className="skeleton-block" />
      <h2>Membuka route canonical…</h2>
      <p>Compatibility route ini tidak menduplikasi konten.</p>
      <ActionLink href={canonical} variant="primary">Lanjutkan</ActionLink>
    </div>
  );
}

function PrototypeControls({
  demo,
  updateDemo,
  simulatedState,
  setSimulatedState,
}: {
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
  simulatedState: SimulatedState;
  setSimulatedState: (state: SimulatedState) => void;
}) {
  if (process.env.NEXT_PUBLIC_SHOW_PROTOTYPE_CONTROLS === "false") return null;

  if (demo.controlsCollapsed) {
    return (
      <button
        className="prototype-control-trigger"
        onClick={() => updateDemo({ controlsCollapsed: false })}
        type="button"
        aria-label="Buka kontrol prototype"
      >
        <SquaresFour size={20} weight="duotone" />
        <span>Preview</span>
      </button>
    );
  }

  return (
    <aside className="prototype-control-panel" aria-label="Kontrol prototype">
      <div className="prototype-control-heading">
        <div><strong>Product preview</strong><span>Simulasi persona dan state</span></div>
        <button onClick={() => updateDemo({ controlsCollapsed: true })} type="button" aria-label="Tutup kontrol">×</button>
      </div>
      <label>
        Persona
        <select
          value={demo.persona}
          onChange={(event) => {
            const persona = event.target.value as Persona;
            updateDemo({
              persona,
              firstValueAchieved: persona === "returning",
            });
            if (persona === "guest") window.location.assign("/");
            if (persona === "new" || persona === "returning") window.location.assign("/home");
            if (persona === "organization") window.location.assign("/organization/nusantara");
          }}
        >
          <option value="guest">Tamu</option>
          <option value="new">Pengguna baru</option>
          <option value="returning">Pengguna lama</option>
          <option value="organization">Organisasi</option>
        </select>
      </label>
      {demo.persona === "organization" && (
        <label>
          Peran Organisasi
          <select
            value={demo.orgRole || "admin"}
            onChange={(event) => updateDemo({ orgRole: event.target.value as "admin" | "member" })}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </label>
      )}
      <label>
        State layar
        <select value={simulatedState} onChange={(event) => setSimulatedState(event.target.value as SimulatedState)}>
          <option value="normal">Normal</option>
          <option value="loading">Loading</option>
          <option value="empty">Empty</option>
          <option value="error">Error</option>
        </select>
      </label>
      <div className="prototype-width-control">
        <span>Preview responsif</span>
        <div>
          {(["1440", "768", "390"] as const).map((width) => (
            <button
              className={demo.previewWidth === width ? "active" : ""}
              key={width}
              onClick={() => updateDemo({ previewWidth: demo.previewWidth === width ? "fluid" : width })}
              type="button"
            >
              {width}
            </button>
          ))}
        </div>
      </div>
      <div className="prototype-reset-row">
        <button onClick={() => {
          setSimulatedState("normal");
          updateDemo({ previewWidth: "fluid" });
          const params = new URLSearchParams(window.location.search);
          params.delete("prototypeState");
          const query = params.toString();
          window.location.assign(query ? `${window.location.pathname}?${query}` : window.location.pathname);
        }} type="button">Reset override</button>
        <button
          onClick={() => {
            if (!window.confirm("Hapus seluruh dummy session prototype? Draft, saved items, shortlist, dan action state akan kembali ke awal.")) return;
            sessionStorage.removeItem("projectlink-demo");
            [
              "projectlink-goal-drafts",
              "projectlink-first-value",
              "projectlink-completed-actions",
              "projectlink-activity",
              "projectlink-rejection-count",
              "projectlink-saved-matches",
              "projectlink-saved-items",
              "projectlink-saved-searches",
              "projectlink-org-state",
            ].forEach((key) => sessionStorage.removeItem(key));
            setSimulatedState("normal");
            updateDemo(defaultDemo);
            window.location.assign("/");
          }}
          type="button"
        >
          Reset sesi
        </button>
      </div>
      <a href="/prototype-map">Buka sitemap</a>
    </aside>
  );
}

function NavIcon({ label, scope }: { label: string; scope?: PublicSearchScope }) {
  const Icon =
    scope === "projects" ? FolderOpen :
    scope === "people" ? UsersThree :
    scope === "organizations" ? Buildings :
    scope === "opportunities" ? Handshake :
    label === "Beranda" ? House :
    label === "Jelajahi" || label === "Explore" ? Compass :
    label === "Proyek" ? FolderOpen :
    label === "Kolaborasi" ? Handshake :
    label === "Notifikasi" ? Bell :
    label === "Profil" ? UserCircle :
    label === "Pencarian" ? MagnifyingGlass :
    label === "Anggota" ? UsersThree :
    SquaresFour;
  return <Icon size={19} weight="duotone" aria-hidden="true" />;
}

function AppShell({
  children,
  pathname,
  searchScope,
  searchQuery,
  demo,
  updateDemo,
  simulatedState,
  setSimulatedState,
}: {
  children: React.ReactNode;
  pathname: string;
  searchScope?: PublicSearchScope;
  searchQuery?: string;
  demo: DemoState;
  updateDemo: (next: Partial<DemoState>) => void;
  simulatedState: SimulatedState;
  setSimulatedState: (state: SimulatedState) => void;
}) {
  const isPublic =
    ["/", "/explore", "/search", "/pricing", "/login", "/register", "/verify-email"].includes(pathname) ||
    pathname.startsWith("/profiles/") ||
    pathname.startsWith("/opportunities/") ||
    (pathname.startsWith("/projects/") && !pathname.endsWith("/manage") && !pathname.endsWith("/contributions"));
  const orgContext =
    demo.persona === "organization" ||
    pathname.startsWith("/org/") ||
    pathname.startsWith("/organization/");
  const nav = orgContext
    ? [
        ["/organization/nusantara", "Beranda"],
        ["/organization/nusantara/projects", "Proyek"],
        ["/organization/nusantara/search?scope=talent", "Pencarian"],
        ["/organization/nusantara/pipeline", "Pipeline"],
        ["/organization/nusantara/members", "Anggota"],
      ]
    : [["/home", "Beranda"], ["/discovery", "Jelajahi"], ["/my-projects", "Proyek"], ["/collaboration", "Kolaborasi"], ["/notifications", "Notifikasi"], ["/me", "Profil"]];
  const contextualSearch = isPublic && pathname === "/search" && searchScope
    ? publicSearchConfig[searchScope]
    : null;

  return (
    <div
      className="prototype-root"
      data-preview-width={demo.previewWidth}
      style={demo.previewWidth === "fluid" ? undefined : { maxWidth: `${demo.previewWidth}px`, marginInline: "auto" }}
    >
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <GlobalStatusAnnouncer />
      <PrototypeControls
        demo={demo}
        updateDemo={updateDemo}
        simulatedState={simulatedState}
        setSimulatedState={setSimulatedState}
      />
      <header className={`site-header${contextualSearch ? " search-mode" : ""}`}>
        <Link className="brand" href={isPublic ? "/" : orgContext ? "/organization/nusantara" : "/home"}>
          <span className="brand-mark">
            <img src="/brand-icon.png" alt="" width="42" height="42" />
          </span>
          <span><strong>ProjectLink</strong><small>Jaringan inovasi berbasis bukti</small></span>
        </Link>
        {contextualSearch && searchScope ? (
          <>
            <Link className="search-back" href="/explore" aria-label="Kembali ke navigasi utama">←</Link>
            <label className="search-category">
              <span className="nav-icon"><NavIcon label={contextualSearch.label} scope={searchScope} /></span>
              <span className="sr-only">Kategori pencarian</span>
              <select
                value={searchScope}
                onChange={(event) =>
                  window.location.assign(`/search?scope=${event.target.value}`)
                }
              >
                {Object.entries(publicSearchConfig).map(([value, item]) => (
                  <option value={value} key={value}>{item.label}</option>
                ))}
              </select>
            </label>
            <form
              className="navbar-search-form"
              action="/search"
              method="get"
              aria-label={`Pencarian ${contextualSearch.label}`}
            >
              <input type="hidden" name="scope" value={searchScope} />
              <label className="navbar-search-input">
                <span className="sr-only">Kata kunci pencarian</span>
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder={contextualSearch.placeholder}
                />
              </label>
              <div className="navbar-filter-row">
                {contextualSearch.filters.map((filter) => (
                  <label className="navbar-filter" key={filter}>
                    <span className="sr-only">{filter}</span>
                    <select name={filter.toLowerCase()}>
                      <option value="">{filter}</option>
                      <option value="all">All {filter.toLowerCase()}</option>
                    </select>
                  </label>
                ))}
              </div>
              <button className="navbar-search-button" type="submit" aria-label="Jalankan pencarian">⌕</button>
            </form>
          </>
        ) : (
          <nav className="primary-nav" aria-label="Navigasi utama">
            {isPublic
              ? publicNav.map((item) => (
                  <Link
                    className={
                      pathname === item.href ||
                      (item.scope && pathname === "/search" && searchScope === item.scope) ||
                      (!item.scope && pathname.startsWith(`${item.href}/`))
                        ? "active"
                        : ""
                    }
                    href={item.href}
                    key={item.href}
                  >
                    <span className="nav-icon"><NavIcon label={item.label} scope={item.scope} /></span>
                    <span>{item.label}</span>
                  </Link>
                ))
              : nav.map(([href, label]) => (
                  <Link
                    className={
                      pathname === href.split("?")[0] ||
                      (href.split("?")[0] !== "/" && pathname.startsWith(`${href.split("?")[0]}/`))
                        ? "active"
                        : ""
                    }
                    href={href}
                    key={href}
                  >
                    <NavIcon label={label} />
                    <span>{label}</span>
                    {label === "Notifikasi" && !demo.notificationDone ? <span className="nav-badge">1</span> : null}
                  </Link>
                ))}
          </nav>
        )}
        <div className="account-area">
          {isPublic ? (
            <>
              <ActionLink href="/login" variant="ghost">Masuk</ActionLink>
              <ActionLink href="/register" variant="primary">Bergabung</ActionLink>
            </>
          ) : (
            <Link className="context-switch" href={orgContext ? "/home" : "/organization/nusantara"}>
              <span>{orgContext ? "NX" : "MP"}</span>
              <span><strong>{orgContext ? "Nexa Research Lab" : "Maya Pradipta"}</strong><small>{orgContext ? "Organisasi · Admin" : `${demo.plan} · Personal`}</small></span>
            </Link>
          )}
        </div>
      </header>
      <main className="page-container" id="main-content" tabIndex={-1}>
        {simulatedState === "normal" ? children : <SimulatedPageState state={simulatedState} onReset={() => setSimulatedState("normal")} />}
      </main>
      {pathname === "/" ? (
        <footer className="site-footer site-footer--full-bleed">
          <div className="site-footer__inner">
            <div><strong>ProjectLink</strong><span>Project evidence network untuk kolaborasi yang lebih dapat dipercaya.</span></div>
            <div><Link href="/prototype-map">Sitemap & decisions</Link><Link href="/pricing">Plans</Link><Link href="/settings/privacy">Privacy</Link></div>
          </div>
        </footer>
      ) : (
        <footer className="site-footer">
          <div><strong>ProjectLink</strong><span>Project evidence network untuk kolaborasi yang lebih dapat dipercaya.</span></div>
          <div><Link href="/prototype-map">Sitemap & decisions</Link><Link href="/pricing">Plans</Link><Link href="/settings/privacy">Privacy</Link></div>
        </footer>
      )}
    </div>
  );
}

export function PrototypeApp() {
  const pathname = usePathname();
  const nextRouter = useRouter();
  const searchParams = useSearchParams();
  const rawSearchScope = searchParams.get("scope");
  const prototypeState = searchParams.get("prototypeState");
  const searchScope =
    rawSearchScope && rawSearchScope in publicSearchConfig
      ? (rawSearchScope as PublicSearchScope)
      : undefined;
  const [demo, setDemo] = useState<DemoState>(defaultDemo);
  const [simulatedState, setSimulatedState] =
    useState<SimulatedState>("normal");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("projectlink-demo");
    if (stored) {
      try {
        setDemo({ ...defaultDemo, ...JSON.parse(stored) });
      } catch {
        setDemo(defaultDemo);
      }
    }
    setHydrated(true);
  }, []);

  const updateDemo = useMemo(
    () => (next: Partial<DemoState>) => {
      setDemo((current) => {
        const updated = { ...current, ...next };
        sessionStorage.setItem("projectlink-demo", JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const router = useMemo(
    () => ({
      ...nextRouter,
      push: (href: string) => {
        window.location.assign(href);
      },
    }),
    [nextRouter],
  );

  const subscription = useMemo(() => {
    let fixture = guestSubscription;
    if (demo.persona === "new") fixture = newUserSubscription;
    if (demo.persona === "returning") fixture = returningUserSubscription;
    if (demo.persona === "organization") {
      fixture = demo.orgRole === "member" ? scenarioFixtures.organizationMember : organizationSubscription;
    }
    return resolveSubscriptionState(demo.persona, fixture, demo.subscriptionOverrides || {});
  }, [demo.persona, demo.orgRole, demo.subscriptionOverrides]);

  const page = useMemo(() => {
    if (!hydrated) {
      return (
        <div className="simulated-state loading">
          <div className="skeleton-block" />
          <h2>Menyiapkan prototype…</h2>
        </div>
      );
    }
    if (pathname === "/") return <GuestHome />;
    if (pathname === "/design-system") return <DesignSystemPreview />;
    if (pathname === "/about") return <PrototypeMapPage />;
    if (pathname === "/explore") return <ExplorePage demo={demo} updateDemo={updateDemo} />;
    if (pathname === "/search") return <ContextualSearchExperience initialScope={searchScope as SearchScope | undefined} />;
    if (pathname === "/projects/aqua-loop") return <PublicEntityExperience scope="projects" slug="aqua-loop" />;
    if (pathname === "/projects/industrial-motor-monitoring") return <PublicEntityExperience scope="projects" slug="industrial-motor-monitoring" />;
    if (pathname === "/projects/smart-cooling") return <PublicEntityExperience scope="projects" slug="smart-cooling" />;
    if (pathname === "/projects/confidential-water-system") return <PublicProjectPage limited demo={demo} updateDemo={updateDemo} router={router} />;
    if (pathname === "/projects/cooling-preview") return <PublicProjectPage limited demo={demo} updateDemo={updateDemo} router={router} />;
    if (pathname.startsWith("/profiles/")) {
      const slug = pathname.split("/").pop() ?? "";
      return <PublicEntityExperience scope="people" slug={slug === "maya" ? "maya-pradipta" : slug} />;
    }
    if (pathname.startsWith("/organizations/")) return <PublicEntityExperience scope="organizations" slug={pathname.split("/").pop() ?? ""} />;
    if (pathname === "/pricing") return <PricingPage />;
    if (pathname === "/login") return <AuthPage mode="login" searchParams={searchParams} updateDemo={updateDemo} router={router} />;
    if (pathname === "/register") return <AuthPage mode="register" searchParams={searchParams} updateDemo={updateDemo} router={router} />;
    if (pathname === "/verify-email") return <AuthPage mode="verify" searchParams={searchParams} updateDemo={updateDemo} router={router} />;
    if (pathname.startsWith("/onboarding/")) return <OnboardingPage step={pathname.split("/").pop() || "goals"} updateDemo={updateDemo} />;
    if (pathname === "/home" || pathname === "/dashboard") {
      return prototypeState === "returning" ||
        (prototypeState !== "new" && (demo.firstValueAchieved || demo.persona === "returning")) ? (
        <ReturningUserHome
          recommendationHidden={demo.recommendationHidden}
          onHideRecommendation={() => updateDemo({ recommendationHidden: !demo.recommendationHidden })}
          subscription={subscription}
        />
      ) : (
        <NewUserHome
          onFirstValue={() => updateDemo({ firstValueAchieved: true, persona: "returning" })}
        />
      );
    }
    if (pathname === "/me") return <MyProfilePage />;
    if (pathname === "/my-projects") return <MyProjectsPage />;
    if (pathname === "/projects/aqua-loop/manage") return <ManageProjectPage />;
    if (pathname === "/projects/aqua-loop/contributions") return <ContributionsPage demo={demo} updateDemo={updateDemo} />;
    if (pathname === "/discovery") return <DiscoveryPage demo={demo} updateDemo={updateDemo} />;
    if (pathname === "/matches/aqua-maya") return <MatchDetailPage />;
    if (pathname === "/saved") return <SavedPage demo={demo} />;
    if (pathname === "/collaboration") return <CollaborationPage demo={demo} updateDemo={updateDemo} />;
    if (pathname === "/collaboration/new") return <CollaborationForm demo={demo} updateDemo={updateDemo} />;
    if (pathname === "/notifications") return <NotificationsPage demo={demo} updateDemo={updateDemo} />;
    if (pathname === "/settings/privacy") return <PrivacyPage />;
    if (pathname === "/subscription") return <SubscriptionPage 
          subscription={subscription} 
          onOverrideChange={(patch) => updateDemo({ 
            subscriptionOverrides: { 
              ...demo.subscriptionOverrides, 
              ...patch 
            } 
          })} 
        />;
    if (pathname.startsWith("/org/nusantara")) {
      const section = pathname.replace("/org/nusantara", "").replace(/^\//, "");
      return <OrganizationPage section={section} demo={demo} updateDemo={updateDemo} />;
    }
    if (pathname === "/org/nusantara") return <CompatibilityRoutePage canonical="/organization/nusantara" />;
    if (pathname === "/org/nusantara/projects") return <CompatibilityRoutePage canonical="/organization/nusantara/projects" />;
    if (pathname.startsWith("/organization/nusantara")) {
      const section = pathname.replace("/organization/nusantara", "").replace(/^\//, "");
      if (section === "billing") {
        return <ProductOrganizationBilling subscription={subscription} canManageBilling={demo.orgRole !== "member"} />;
      }
      return section ? <OrganizationWorkspaceExperience section={section} /> : <OrganizationHome subscription={subscription} />;
    }
    if (pathname === "/plans/organization") return <ProductOrganizationPlans />;
    if (pathname === "/prototype-map") return <PrototypeMapPage />;
    if (pathname.startsWith("/opportunities/")) {
      const slug = pathname.split("/").pop() ?? "";
      return <PublicEntityExperience scope="opportunities" slug={slug === "urban-heat" ? "urban-heat-mapping" : slug} />;
    }
    return <NotFoundPage />;
  }, [demo, hydrated, pathname, prototypeState, router, searchParams, searchScope, updateDemo, subscription]);

  return (
    <AppShell
      pathname={pathname}
      searchScope={searchScope}
      searchQuery={searchParams.get("q") ?? undefined}
      demo={demo}
      updateDemo={updateDemo}
      simulatedState={simulatedState}
      setSimulatedState={setSimulatedState}
    >
      {page}
    </AppShell>
  );
}
