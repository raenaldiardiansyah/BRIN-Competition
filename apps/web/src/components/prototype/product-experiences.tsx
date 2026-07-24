"use client";

import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  CheckCircle,
  ClipboardText,
  Clock,
  Faders,
  FolderOpen,
  Handshake,
  Info,
  MagnifyingGlass,
  MapPin,
  NotePencil,
  Plus,
  ShieldCheck,
  Sparkle,
  UserCircle,
  UsersThree,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/ui/BackButton";
import {
  filterLabels,
  filterOptions,
  getFilterOptionsForScope,
  scopeConfig,
  searchItems,
  type SearchItem,
  type SearchScope,
} from "@/dummy/registry";
import { dummyProjects } from "@/dummy/registry/projects";
import { dummyOrganizations } from "@/dummy/registry/organizations";
import { dummyProfiles } from "@/dummy/registry/profiles";
import { dummyContributions } from "@/dummy/registry/contributions";
import { dummyEvidence } from "@/dummy/registry/evidence";
import { dummyMatches } from "@/dummy/registry/matches";
import { announce } from "./accessibility";

function go(url: string) {
  window.location.assign(url);
}

function useReplaceQuery() {
  const router = useRouter();
  const pathname = usePathname();
  return (next: URLSearchParams) => {
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
}

function usePrototypeSession<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        setValue(JSON.parse(stored) as T);
      } catch {
        setValue(initial);
      }
    }
  }, [key]);
  const update = (next: T) => {
    setValue(next);
    sessionStorage.setItem(key, JSON.stringify(next));
  };
  return [value, update] as const;
}

function IconForScope({ scope, size = 22 }: { scope: SearchScope; size?: number }) {
  const Icon =
    scope === "projects" ? FolderOpen :
    scope === "people" ? UsersThree :
    scope === "organizations" ? Buildings :
    Handshake;
  return <Icon size={size} weight="duotone" />;
}

function Status({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "teal" | "warning" }) {
  return <span className={`px-status ${tone}`}>{children}</span>;
}

function SearchResultCard({
  item,
  selected,
  onSelect,
}: {
  item: SearchItem;
  selected: boolean;
  onSelect?: (slug: string) => void;
}) {
  const params = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );
  params.set("selected", item.slug);
  return (
    <a
      className={`px-result-card${selected ? " selected" : ""}`}
      href={`/search?${params.toString()}`}
      onClick={(e) => {
        if (onSelect) {
          e.preventDefault();
          onSelect(item.slug);
        }
      }}
      aria-current={selected ? "true" : undefined}
    >
      <div className="px-result-icon"><IconForScope scope={item.scope} /></div>
      <div className="px-result-copy">
        <div className="px-result-top">
          <Status tone={item.status === "CLOSED" || item.status === "PENDING_VERIFICATION" ? "warning" : "teal"}>
            {item.readiness ?? item.availability ?? item.status}
          </Status>
          <span>{item.location}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="px-result-owner">{item.owner}</p>
        <p>{item.summary}</p>
        <div className="px-result-reason">
          <Sparkle size={15} weight="fill" />
          {item.reasons[0]}
        </div>
      </div>
      <ArrowRight size={18} />
    </a>
  );
}

function SearchDetail({ item, onClose }: { item: SearchItem; onClose?: () => void }) {
  const [saved, setSaved] = usePrototypeSession<string[]>("projectlink-saved-items", []);
  const isSaved = saved.includes(item.id);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("selected");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  const getPrimaryAction = () => {
    switch (item.scope) {
      case "people":
        return { label: "Lihat profil", href: item.href || `/profiles/${item.slug}` };
      case "organizations":
        return { label: "Lihat organisasi", href: item.href || `/organizations/${item.slug}` };
      case "opportunities":
        return { label: "Lihat peluang", href: item.href || `/opportunities/${item.slug}` };
      case "projects":
      default:
        return { label: "Buka proyek", href: item.href || `/projects/${item.slug}` };
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <aside className="px-search-detail" aria-label={`Detail ${item.title}`}>
      <div className="px-detail-heading">
        <div className="px-result-icon large"><IconForScope scope={item.scope} size={27} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Status tone="teal">{item.status}</Status>
            <button
              className="button ghost"
              onClick={handleClose}
              style={{ padding: '4px' }}
              aria-label="Tutup detail"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          <h2>{item.title}</h2>
          <p>{item.owner}</p>
        </div>
      </div>
      <p>{item.summary}</p>
      <section>
        <h3>Mengapa hasil ini relevan</h3>
        <ul className="px-check-list">
          {item.reasons.map((reason) => <li key={reason}><CheckCircle size={18} weight="fill" />{reason}</li>)}
        </ul>
      </section>
      <section>
        <h3>Evidence tersedia</h3>
        {item.evidence.map((evidence) => <div className="px-evidence-line" key={evidence}><ClipboardText size={18} />{evidence}</div>)}
      </section>
      <section className="px-gap-box">
        <h3>Gap dan keterbatasan</h3>
        {item.gaps.map((gap) => <p key={gap}><Info size={17} />{gap}</p>)}
      </section>
      <div className="px-detail-actions">
        {primaryAction.href && primaryAction.label && (
          <a
            className="pl-button tautin-search-detail-primary-action"
            href={primaryAction.href}
          >
            {primaryAction.label} <ArrowRight size={17} />
          </a>
        )}
        <button
          className="pl-button pl-button-secondary"
          onClick={() => {
            setSaved(isSaved ? saved.filter((id) => id !== item.id) : [...saved, item.id]);
            announce(isSaved ? `${item.title} dihapus dari item tersimpan.` : `${item.title} disimpan.`);
          }}
          type="button"
        >
          {isSaved ? "Tersimpan ✓" : "Simpan"}
        </button>
      </div>
    </aside>
  );
}

export function ContextualSearchExperience({ initialScope }: { initialScope?: SearchScope }) {
  const searchParams = useSearchParams();
  const replaceQuery = useReplaceQuery();
  const [localSelected, setLocalSelected] = useState<string | null>(searchParams.get("selected"));

  useEffect(() => {
    setLocalSelected(searchParams.get("selected"));
  }, [searchParams]);

  const scope = (searchParams.get("scope") as SearchScope | null) ?? initialScope;
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "relevance";
  const prototypeState = searchParams.get("prototypeState");
  useEffect(() => {
    if (searchParams.get("saved") === "1") {
      announce("Pencarian tersimpan. Query dan filter dipertahankan setelah autentikasi.");
    }
  }, [searchParams]);
  if (!scope || !(scope in scopeConfig)) {
    return (
      <div className="px-scope-picker">
        <p className="pl-eyebrow">Pencarian terarah</p>
        <h1>Apa yang ingin Anda cari?</h1>
        <p>Pilih scope agar filter dan alasan hasil tetap jelas.</p>
        <div className="px-scope-grid">
          {(Object.keys(scopeConfig) as SearchScope[]).map((value) => (
            <a href={`/search?scope=${value}`} key={value}>
              <IconForScope scope={value} size={28} />
              <strong>{scopeConfig[value].label}</strong>
              <span>{scopeConfig[value].queryPlaceholder}</span>
              <ArrowRight size={18} />
            </a>
          ))}
        </div>
      </div>
    );
  }
  const activeConfig = scopeConfig[scope];
  const dynamicFilterOptions = getFilterOptionsForScope(scope);
  const [invalidFilterCleaned, setInvalidFilterCleaned] = useState(false);

  useEffect(() => {
    const validMap = getFilterOptionsForScope(scope);
    const toClean: string[] = [];

    activeConfig.filters.forEach((filterKey) => {
      const val = searchParams.get(filterKey);
      if (val) {
        const allowed = validMap[filterKey] ?? filterOptions[filterKey];
        if (allowed && !allowed.includes(val)) {
          toClean.push(filterKey);
        }
      }
    });

    if (toClean.length > 0) {
      const next = new URLSearchParams(searchParams.toString());
      toClean.forEach((k) => next.delete(k));
      replaceQuery(next);
      setInvalidFilterCleaned(true);
      announce("Filter yang tidak dikenali telah dibersihkan.");
    }
  }, [scope, searchParams]);

  const activeFilters: [string, string][] = [
    ...activeConfig.filters
      .map((key) => [key, searchParams.get(key)] as [string, string | null])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
    ...(searchParams.get("organization") ? [["organization", searchParams.get("organization")!] as [string, string]] : []),
  ];

  const results = searchItems
    .filter((item) => item.scope === scope)
    .filter((item) => {
      if (!q) return true;
      const normalizedQ = q.trim().toLowerCase();
      const haystack = [
        item.title,
        item.owner,
        item.summary,
        item.field,
        item.location,
        item.status,
        ...(item.skills ?? []),
        ...(item.technologies ?? []),
        ...(item.reasons ?? []),
      ].join(" ").toLowerCase();
      return haystack.includes(normalizedQ);
    })
    .filter((item) => activeFilters.every(([key, value]) => {
      if (key === "field") return item.field === value;
      if (key === "readiness") return item.readiness === value;
      if (key === "availability") return item.availability === value;
      if (key === "location") return item.location === value;
      if (key === "status" || key === "lifecycle") return item.status === value;
      if (key === "profileType") return item.profileType === value;
      if (key === "organizationType") return item.organizationType === value;
      if (key === "opportunityType") return item.opportunityType === value;
      if (key === "skill") return item.skills?.includes(value);
      if (key === "experience") return item.experienceLevel === value;
      if (key === "technology") return item.technologies?.includes(value);
      if (key === "need") return item.collaborationNeeds?.includes(value);
      if (key === "workMode") return item.workMode === value;
      if (key === "size") return item.organizationSize === value;
      if (key === "acceptsCollab") return value === "Ya" ? item.acceptsCollaboration === true : item.acceptsCollaboration === false;
      if (key === "requiredSkill") return item.requiredSkills?.includes(value);
      if (key === "ownership") {
        if (value === "internal") {
          return (
            (item.organizationId && item.organizationId.toLowerCase().includes("nexa")) ||
            (item.owner && item.owner.toLowerCase().includes("nexa"))
          );
        }
        if (value === "external") {
          return (
            (!item.organizationId || !item.organizationId.toLowerCase().includes("nexa")) &&
            (!item.owner || !item.owner.toLowerCase().includes("nexa"))
          );
        }
        return true;
      }
      if (key === "deadlineRange") {
        const days = item.daysUntilDeadline;
        if (days == null) return true;
        if (value === "7_DAYS") return days <= 7;
        if (value === "30_DAYS") return days <= 30;
        if (value === "OVER_30_DAYS") return days > 30;
        return true;
      }
      if (key === "organization") {
        return true; // Discovery mode allows both internal & external
      }
      return true;
    }))
    .sort((a, b) => {
      if (sort === "evidence") return (b.evidenceCount ?? b.evidence?.length ?? 0) - (a.evidenceCount ?? a.evidence?.length ?? 0);
      if (sort === "projects") return (b.projectCount ?? 0) - (a.projectCount ?? 0);
      if (sort === "opportunities") return (b.activeOpportunityCount ?? 0) - (a.activeOpportunityCount ?? 0);
      if (sort === "readiness") {
        const order: Record<string, number> = { IMPLEMENTED: 5, PILOT: 4, TESTING: 3, PROTOTYPE: 2, RESEARCH: 1 };
        return (order[b.readiness ?? ""] ?? 0) - (order[a.readiness ?? ""] ?? 0);
      }
      if (sort === "recent") return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
      if (sort === "deadline") return (a.deadline ?? "").localeCompare(b.deadline ?? "");
      return 0; // relevance
    });

  const selectedItem = results.find((item) => item.slug === localSelected);

  const handleSelect = (slug: string) => {
    setLocalSelected(slug);
    const next = new URLSearchParams(searchParams.toString());
    next.set("selected", slug);
    replaceQuery(next);
  };

  const handleClose = () => {
    setLocalSelected(null);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("selected");
    replaceQuery(next);
  };

  const changeScope = (nextScope: SearchScope) => {
    const next = new URLSearchParams();
    next.set("scope", nextScope);
    if (q) next.set("q", q);
    const nextConfig = scopeConfig[nextScope];
    activeFilters.forEach(([key, value]) => {
      if (nextConfig.filters.includes(key as never) && value) next.set(key, value);
    });
    const validatedSort = nextConfig.sorts.includes(sort as never) ? sort : "relevance";
    if (validatedSort !== "relevance") next.set("sort", validatedSort);
    if (prototypeState) next.set("prototypeState", prototypeState);
    setLocalSelected(null);
    replaceQuery(next);
  };

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    next.delete("selected");
    setLocalSelected(null);
    replaceQuery(next);
  };

  const resetAllFilters = () => {
    const next = new URLSearchParams();
    next.set("scope", scope);
    setLocalSelected(null);
    replaceQuery(next);
  };

  const returnTo = `/search?${searchParams.toString()}`;
  const saveHref = `/login?returnTo=${encodeURIComponent(returnTo)}&action=save-search`;

  return (
    <div className={`px-search-experience${selectedItem ? " has-selected" : ""}`}>
      <header className="px-search-heading">
        <div>
          <p className="pl-eyebrow">Pencarian publik · {activeConfig.label}</p>
          <h1>Temukan {activeConfig.label.toLowerCase()} dengan konteks yang dapat diperiksa.</h1>
          <p>Gunakan search bar pada Navbar di atas untuk mengubah pencarian, kriteria, dan filter.</p>
        </div>
        <a className="pl-button pl-button-secondary" href={saveHref}>Simpan pencarian</a>
      </header>
      {searchParams.get("saved") === "1" ? (
        <div className="px-save-banner"><CheckCircle size={19} weight="fill" /> Pencarian tersimpan. Query dan filter tetap sama setelah autentikasi.</div>
      ) : null}

      {invalidFilterCleaned ? (
        <div className="px-save-banner" style={{ background: "#fff8e6", borderColor: "#ffe082", color: "#8c6b00" }}>
          <Info size={19} weight="fill" /> Filter yang tidak dikenali telah dibersihkan.
        </div>
      ) : null}

      <div className="px-active-filter-row">
        <span>{results.length} hasil {q ? `untuk "${q}"` : ""}</span>
        {activeFilters.map(([key, value]) => {
          let labelVal = value;
          if (key === "deadlineRange") {
            if (value === "7_DAYS") labelVal = "≤ 7 Hari";
            else if (value === "30_DAYS") labelVal = "≤ 30 Hari";
            else if (value === "OVER_30_DAYS") labelVal = "> 30 Hari";
          }
          if (key === "ownership") {
            if (value === "internal") labelVal = "Internal Nexa";
            else if (value === "external") labelVal = "Eksternal & Mitra";
            else labelVal = "Semua";
          }
          if (key === "organization") labelVal = "Nexa Research Lab";
          return (
            <button onClick={() => clearFilter(key)} type="button" key={key}>
              {key === "organization" ? "Konteks" : (filterLabels[key] ?? key)}: {labelVal} <X size={14} />
            </button>
          );
        })}
        {(activeFilters.length || q) ? (
          <button className="clear" onClick={resetAllFilters} type="button">Hapus semua filter</button>
        ) : null}
      </div>

      <div className="px-search-layout">

        <section className="px-result-list" aria-label="Hasil pencarian">
          {prototypeState === "loading" ? (
            Array.from({ length: 3 }).map((_, index) => <div className="px-result-skeleton" key={index} />)
          ) : prototypeState === "error" ? (
            <div className="px-search-state">
              <WarningCircle size={38} weight="duotone" />
              <h2>Pencarian belum berhasil dimuat</h2>
              <p>Kriteria Anda tetap tersimpan. Coba lagi tanpa membuat pencarian baru.</p>
              <a className="pl-button pl-button-primary" href={`/search?${searchParams.toString().replace("prototypeState=error", "")}`}>Coba lagi</a>
            </div>
          ) : results.length ? (
            results.map((item) => <SearchResultCard item={item} selected={localSelected === item.slug} onSelect={handleSelect} key={item.id} />)
          ) : (
            <div className="px-search-state">
              <MagnifyingGlass size={38} weight="duotone" />
              <h2>Tidak ada hasil yang sesuai</h2>
              <p>Query “{q || "—"}” dengan {activeFilters.length} filter aktif belum menghasilkan kecocokan.</p>
              <div className="px-suggestion-box">
                <strong>Saran</strong>
                <span>Gunakan istilah yang lebih luas</span>
                <span>Coba bidang terkait: IoT atau Environmental Data</span>
                <span>Hapus filter kesiapan atau lokasi</span>
              </div>
              <button className="pl-button pl-button-primary pl-action-primary" onClick={resetAllFilters} type="button">
                Reset semua filter
              </button>
            </div>
          )}
        </section>
        {selectedItem ? <SearchDetail item={selectedItem} onClose={handleClose} /> : null}
      </div>
    </div>
  );
}

function PublicHero({ item }: { item: SearchItem }) {
  const Icon = item.scope === "people" ? UserCircle : item.scope === "organizations" ? Buildings : item.scope === "opportunities" ? Handshake : FolderOpen;
  return (
    <header className="px-public-hero">
      <a href={`/search?scope=${item.scope}&selected=${item.slug}`}><ArrowLeft size={17} /> Kembali ke hasil</a>
      <div className="px-public-title">
        <span className="px-public-icon"><Icon size={35} weight="duotone" /></span>
        <div><Status tone="teal">{item.status}</Status><h1>{item.title}</h1><p>{item.owner} · {item.location}</p></div>
      </div>
      <p className="px-public-summary">{item.summary}</p>
    </header>
  );
}

function evidenceSourceLabel(sourceStatus: string) {
  if (sourceStatus === "AVAILABLE") return "Tersedia";
  if (sourceStatus === "UNAVAILABLE") return "Tidak tersedia";
  return sourceStatus;
}

function evidenceReviewLabel(reviewStatus: string) {
  if (reviewStatus === "VERIFIED") return "Dikonfirmasi";
  if (reviewStatus === "PENDING") return "Menunggu konfirmasi";
  return "Belum diverifikasi independen";
}

function PublicProjectDetailSection({
  item,
  demo,
}: {
  item: SearchItem;
  demo?: { persona?: string };
}) {
  const isGuest = demo?.persona === "guest";
  const isAquaLoop = item.slug === "aqua-loop";
  const project = dummyProjects.find((p) => p.slug === item.slug);
  if (!project) return null;

  const contributions = dummyContributions.filter((c) => c.projectId === project.id);
  const evidences = dummyEvidence.filter((e) => e.projectId === project.id);

  const masalahText = project.problem;
  const solusiText = project.collaborationNeeds?.[0]?.title
    ? `Kebutuhan kolaborasi aktif: ${project.collaborationNeeds[0].title}.`
    : "Solusi terintegrasi menggunakan sensor dan pipeline data untuk pemantauan berkala.";

  const readinessSource = project.readinessSource ?? "Self-declared";

  const members = contributions.map((c) => {
    const profile = dummyProfiles.find((p) => p.id === c.profileId);
    return {
      id: c.id,
      name: profile?.displayName ?? "Unknown",
      role: c.role,
      contribution: c.responsibility,
    };
  });

  const evidencesList = evidences.map((e) => {
    const restricted = isGuest && e.visibility !== "PUBLIC";
    return {
      id: e.id,
      name: e.title,
      type: e.type,
      owner: restricted ? undefined : e.ownership,
      sourceStatus: e.sourceStatus,
      reviewStatus: e.reviewStatus,
      visibility: e.visibility,
      restricted,
    };
  });

  const openNeed = project.collaborationNeeds?.find((n) => n.status === "OPEN");
  const kebutuhanText = openNeed
    ? `Membuka peluang bagi ${openNeed.role} dengan komitmen ${openNeed.commitment ?? project.commitment ?? "fleksibel"}.`
    : "Membutuhkan kolaborator untuk validasi sensor lapangan.";
  const gapText = openNeed?.title ?? "Belum ada gap terbuka";

  return (
    <div className="px-project-detail-extended tw:space-y-6">
      <section className="px-content-card">
        <h2>Masalah & Solusi Inovasi</h2>
        <div className="tw:space-y-4">
          <div className="tw:border-l-4 tw:border-slate-300 tw:pl-4">
            <span className="tw:block tw:text-xs tw:font-semibold tw:text-slate-500 tw:uppercase">Masalah yang Diselesaikan</span>
            <p className="tw:text-sm tw:text-slate-700 tw:mt-1">{masalahText}</p>
          </div>
          <div className="tw:border-l-4 tw:border-blue-500 tw:pl-4">
            <span className="tw:block tw:text-xs tw:font-semibold tw:text-slate-500 tw:uppercase">Solusi & Teknologi</span>
            <p className="tw:text-sm tw:text-slate-700 tw:mt-1">{solusiText}</p>
          </div>
        </div>
      </section>

      <section className="px-content-card">
        <h2>Lifecycle & Penilaian Kesiapan</h2>
        <div className="px-info-grid tw:mb-4">
          <div>
            <span>Tingkat Kesiapan (Readiness)</span>
            <strong className="tw:text-blue-600">{project.readiness}</strong>
          </div>
          <div>
            <span>Status Proyek</span>
            <strong>{project.lifecycle}</strong>
          </div>
        </div>
        <div className="px-verification">
          <Info size={24} className="tw:text-blue-500" />
          <div>
            <strong>Sumber Penilaian Readiness</strong>
            <span className="tw:text-xs tw:text-slate-600 tw:block tw:mt-1">{readinessSource}</span>
          </div>
        </div>
      </section>

      <section className="px-content-card">
        <h2>Anggota Proyek & Kontribusi Nyata</h2>
        <div className="tw:space-y-4">
          {members.map((member) => (
            <div key={member.id} className="tw:p-3 tw:bg-slate-50 tw:rounded-xl tw:border tw:border-slate-100">
              <div className="tw:flex tw:items-center tw:justify-between">
                <strong className="tw:text-sm tw:text-slate-800">{member.name}</strong>
                <span className="tw:text-xs tw:font-medium tw:text-slate-500 tw:bg-slate-200/60 tw:px-2 tw:py-0.5 tw:rounded-md">{member.role}</span>
              </div>
              <p className="tw:text-xs tw:text-slate-600 tw:mt-1">Kontribusi: {member.contribution}</p>
            </div>
          ))}
        </div>
        {isAquaLoop ? (
          <div className="tw:mt-4">
            <a href={`/projects/${project.slug}/contributions`} className="pl-button pl-button-secondary tw:w-full tw:text-center tw:block">
              Periksa Kontribusi Transparan & Histori
            </a>
          </div>
        ) : null}
      </section>

      <section className="px-content-card">
        <h2>Dokumen & Bukti (Evidence)</h2>
        <div className="tw:space-y-3 tw:mb-4">
          {evidencesList.map((ev) => (
            <div key={ev.id} className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl">
              <div className="tw:flex tw:items-center tw:gap-3">
                <ClipboardText size={20} className="tw:text-slate-400" />
                <div>
                  <strong className="tw:block tw:text-xs tw:text-slate-800">{ev.name}</strong>
                  <span className="tw:block tw:text-[10px] tw:text-slate-500">
                    {ev.type} · {evidenceSourceLabel(ev.sourceStatus)} · {ev.visibility}
                    {ev.owner ? ` · Pemilik: ${ev.owner}` : ev.restricted ? " · Metadata terbatas" : ""}
                  </span>
                </div>
              </div>
              <Status tone={ev.reviewStatus === "VERIFIED" ? "teal" : ev.reviewStatus === "PENDING" ? "blue" : "warning"}>
                {evidenceReviewLabel(ev.reviewStatus)}
              </Status>
            </div>
          ))}
        </div>
        {isAquaLoop ? (
          <div className="tw:mb-4">
            <a href={`/projects/${project.slug}/contributions#evidence`} className="pl-button pl-button-secondary tw:w-full tw:text-center tw:block">
              Buka & Periksa Semua Evidence
            </a>
          </div>
        ) : null}
        <p className="tw:text-[11px] tw:text-slate-400 tw:italic">
          Status dikonfirmasi terikat secara spesifik pada masing-masing dokumen evidence dan tidak berlaku sebagai klaim menyeluruh terhadap seluruh komponen proyek.
        </p>
      </section>

      <section className="px-content-card">
        <h2>Kebutuhan Kolaborasi</h2>
        <div className="tw:p-4 tw:bg-blue-50/50 tw:border tw:border-blue-100 tw:rounded-2xl">
          <div className="tw:mb-3">
            <strong className="tw:block tw:text-xs tw:font-semibold tw:text-blue-900">Peran yang Dibutuhkan</strong>
            <p className="tw:text-sm tw:text-slate-700 tw:mt-1">{kebutuhanText}</p>
          </div>
          <div>
            <strong className="tw:block tw:text-xs tw:font-semibold tw:text-blue-900">Gap Saat Ini</strong>
            <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-amber-100 tw:text-amber-800 tw:mt-1">
              {gapText}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectExplainableMatchingSection({
  item,
  demo,
}: {
  item: SearchItem;
  demo?: { persona?: string };
}) {
  const isGuest = demo?.persona === "guest";
  const project = dummyProjects.find((p) => p.slug === item.slug);
  const match = dummyMatches.find((m) => m.projectId === project?.id);

  if (isGuest) {
    return (
      <section className="px-content-card">
        <div className="tw:flex tw:items-center tw:gap-2 tw:mb-4">
          <Sparkle size={20} className="tw:text-amber-500" />
          <h2>Explainable Matching (AI)</h2>
        </div>
        <div className="tw:p-4 tw:bg-slate-50 tw:border tw:border-dashed tw:border-slate-200 tw:rounded-xl tw:text-center">
          <p className="tw:text-xs tw:text-slate-600 tw:mb-3">Analisis keselarasan AI dan skor kecocokan disembunyikan untuk tamu.</p>
          <a href={`/login?returnTo=${encodeURIComponent(item.href)}&action=view-matching`} className="pl-button pl-button-secondary tw:inline-block">
            Masuk untuk melihat kecocokan
          </a>
        </div>
      </section>
    );
  }

  if (!match) return null;

  return (
    <section className="px-content-card">
      <div className="tw:flex tw:items-center tw:gap-2 tw:mb-4">
        <Sparkle size={20} className="tw:text-blue-600" />
        <h2>Explainable Matching (AI)</h2>
      </div>

      <div className="tw:mb-4">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-1">
          <span className="tw:text-xs tw:font-semibold tw:text-slate-500">Keyakinan rekomendasi</span>
          <span className="tw:text-xs tw:font-bold tw:text-blue-600">{match.core.confidence}</span>
        </div>
        {typeof match.score === "number" ? (
          <>
            <div className="tw:w-full tw:bg-slate-200 tw:rounded-full tw:h-2">
              <div className="tw:bg-blue-600 tw:h-2 tw:rounded-full" style={{ width: `${match.score}%` }} />
            </div>
            <p className="tw:text-[10px] tw:text-slate-500 tw:mt-1">Skor metadata sekunder: {match.score}%</p>
          </>
        ) : null}
      </div>

      <div className="tw:space-y-4">
        <div>
          <strong className="tw:block tw:text-xs tw:text-slate-500">Alasan Kecocokan Utama</strong>
          <p className="tw:text-xs tw:text-slate-800 tw:font-semibold tw:mb-1">{match.core.primaryReason}</p>
          <ul className="tw:list-disc tw:list-inside tw:text-xs tw:text-slate-700 tw:space-y-1">
            {match.core.supportingEvidence.map(evidence => (
              <li key={evidence}>{evidence}</li>
            ))}
          </ul>
        </div>

        <div>
          <strong className="tw:block tw:text-xs tw:text-slate-500">Keterbatasan & Gap Penilaian</strong>
          <ul className="tw:list-disc tw:list-inside tw:text-xs tw:text-slate-700 tw:space-y-1 tw:mt-1">
            {match.core.mainGap && <li>{match.core.mainGap}</li>}
            {match.core.dataLimitation && <li>{match.core.dataLimitation}</li>}
          </ul>
        </div>
      </div>

      <div className="tw:mt-4 tw:pt-2 tw:border-t tw:border-slate-100">
        <a href="/matches/aqua-maya" className="pl-button pl-button-secondary tw:w-full tw:text-center tw:block">
          Lihat Analisis Kecocokan Rinci
        </a>
      </div>
    </section>
  );
}

export function PublicEntityExperience({
  scope,
  slug,
  demo,
  updateDemo,
  router,
}: {
  scope: SearchScope;
  slug: string;
  demo?: any;
  updateDemo?: (next: any) => void;
  router?: any;
}) {
  const item = searchItems.find((candidate) => candidate.scope === scope && candidate.slug === slug);
  if (!item) {
    return (
      <div className="px-search-state">
        <WarningCircle size={42} />
        <h1>Konten publik tidak tersedia</h1>
        <p>Konten mungkin privat, dihapus, atau belum termasuk static registry.</p>
        <a className="pl-button pl-button-primary" href={`/search?scope=${scope}`}>Kembali ke pencarian</a>
      </div>
    );
  }

  const isProject = scope === "projects";
  const isGuest = demo?.persona === "guest";
  const isOrg = demo?.persona === "organization";

  let colabHref = `/collaboration/new?project=${item.slug}`;
  if (isGuest) {
    colabHref = `/login?returnTo=${encodeURIComponent(`/${scope}/${item.slug}`)}&action=collaborate`;
  }

  return (
    <div className="px-public-page">
      <PublicHero item={item} />
      <div className="px-public-grid">
        <main className="tw:space-y-6">
          {isProject ? (
            <>
              <PublicProjectDetailSection item={item} demo={demo} />
              <ProjectExplainableMatchingSection item={item} demo={demo} />
            </>
          ) : (
            <>
              <section className="px-content-card">
                <h2>{scope === "people" ? "Kontribusi proyek" : scope === "organizations" ? "Bidang dan aktivitas publik" : scope === "opportunities" ? "Masalah dan scope kontribusi" : "Masalah yang diselesaikan"}</h2>
                <p>{item.summary} Informasi ini diringkas dari data publik dan tidak mengungkap data privat.</p>
                <div className="px-info-grid">
                  <div><span>Bidang</span><strong>{item.field}</strong></div>
                  <div><span>Lokasi</span><strong>{item.location}</strong></div>
                  <div><span>Status</span><strong>{item.status}</strong></div>
                  <div><span>{scope === "people" ? "Availability" : scope === "opportunities" ? "Komitmen" : "Readiness"}</span><strong>{item.availability ?? item.commitment ?? item.readiness ?? "Publik"}</strong></div>
                </div>
              </section>
              <section className="px-content-card">
                <h2>Evidence dan konfirmasi</h2>
                <div className="px-verification"><ShieldCheck size={24} weight="duotone" /><div><strong>{item.verification}</strong><span>Status hanya indikasi lokal; tidak menjadi klaim independen menyeluruh.</span></div></div>
                {item.evidence.map((evidence) => <div className="px-evidence-line" key={evidence}><ClipboardText size={18} />{evidence}</div>)}
              </section>
              {scope === "people" ? (
                <section className="px-content-card"><h2>Contribution confirmation</h2><p>AquaLoop · Data pipeline contributor · Dikonfirmasi project owner pada 12 Juli 2026.</p></section>
              ) : null}
              {scope === "organizations" ? (
                <section className="px-content-card"><h2>Proyek, peluang, dan anggota pilihan</h2><div className="px-mini-list"><a href="/projects/industrial-motor-monitoring">Industrial Motor Monitoring</a><a href="/opportunities/urban-heat-mapping">Urban Heat Mapping Collaboration</a><a href="/profiles/nadia-putri">Nadia Putri · Researcher</a></div></section>
              ) : null}
              {scope === "opportunities" ? (
                <section className="px-content-card"><h2>Required contribution</h2><ul><li>Membangun pipeline data yang dapat direproduksi.</li><li>Mendokumentasikan validation result.</li><li>Berpartisipasi 6–8 jam per minggu sebelum deadline 30 September 2026.</li></ul></section>
              ) : null}
            </>
          )}
        </main>
        <aside className="px-public-action">
          <Status tone="blue">{item.verification}</Status>
          <h2>Tindakan berikutnya</h2>
          <p>{scope === "people" ? "Mulai permintaan kolaborasi dengan konteks proyek." : scope === "organizations" ? "Lihat peluang atau ajukan kolaborasi terstruktur." : scope === "opportunities" ? "Tinjau kebutuhan sebelum mengajukan kontribusi." : "Simpan atau mulai kolaborasi pada proyek ini."}</p>

          {isProject ? (
            isOrg ? (
              <div className="tw:space-y-2">
                <button
                  className="pl-button tautin-collaboration-primary-action tw:w-full tw:opacity-50 tw:cursor-not-allowed tw:flex tw:items-center tw:justify-center"
                  disabled
                >
                  Ajukan kolaborasi
                </button>
                <p className="tw:text-[11px] tw:text-slate-500 tw:text-center">
                  Organisasi tidak dapat melamar proyek sebagai kontributor individu. Silakan gunakan akun personal Anda.
                </p>
              </div>
            ) : (
              <div className="tw:space-y-2">
                <a
                  className="pl-button tautin-collaboration-primary-action tw:w-full tw:text-center tw:flex tw:items-center tw:justify-center"
                  href={colabHref}
                >
                  Ajukan kolaborasi
                </a>
                {isGuest && (
                  <p className="tw:text-[11px] tw:text-slate-500 tw:text-center">
                    Login diperlukan untuk melanjutkan pengajuan kolaborasi personal.
                  </p>
                )}
              </div>
            )
          ) : (
            <a
              className="pl-button tautin-collaboration-primary-action tw:w-full tw:text-center tw:flex tw:items-center tw:justify-center"
              href={colabHref}
            >
              {scope === "opportunities" ? "Ajukan kontribusi" : "Mulai kolaborasi"}
            </a>
          )}

          <a
            className="pl-button pl-button-secondary tw:w-full tw:text-center tw:flex tw:items-center tw:justify-center"
            href={`/search?scope=${scope}`}
          >
            Lihat yang serupa
          </a>
        </aside>
      </div>
    </div>
  );
}

type OrgState = {
  shortlists: string[];
  reviewer: string;
  requestedInfo: string[];
  pipelineStage: string;
  notes: string[];
  memberInvited: boolean;
  billingRefreshed: boolean;
  decision: "PENDING" | "ACCEPTED" | "DECLINED";
};

const initialOrgState: OrgState = {
  shortlists: ["maya-pradipta"],
  reviewer: "",
  requestedInfo: [],
  pipelineStage: "REVIEWING",
  notes: [],
  memberInvited: false,
  billingRefreshed: false,
  decision: "PENDING",
};

export function OrganizationWorkspaceExperience({ section }: { section: string }) {
  const searchParams = useSearchParams();
  const replaceQuery = useReplaceQuery();
  const [localSelected, setLocalSelected] = useState<string | null>(searchParams.get("selected"));

  useEffect(() => {
    setLocalSelected(searchParams.get("selected"));
  }, [searchParams]);

  const [orgState, setOrgState] = usePrototypeSession<OrgState>("projectlink-org-state", initialOrgState);
  const scope = searchParams.get("scope");
  const q = searchParams.get("q") ?? "";
  const [mobilePanel, setMobilePanel] = useState<"filters" | "results" | "detail">(localSelected ? "detail" : "results");

  const updateOrg = (patch: Partial<OrgState>, message?: string) => {
    setOrgState({ ...orgState, ...patch });
    if (message) announce(message);
  };

  useEffect(() => {
    if (localSelected) setMobilePanel("detail");
  }, [localSelected]);

  if (section === "search") {
    if (scope !== "talent" && scope !== "projects") {
      return (
        <div className="px-scope-picker">
          <p className="pl-eyebrow">Pencarian organisasi</p><h1>Apa yang ingin tim Anda temukan?</h1>
          <div className="px-scope-grid two">
            <a href="/organization/nexa-research-lab/search?scope=talent"><UsersThree size={30} /><strong>Cari talent</strong><span>Orang berdasarkan kontribusi, evidence, availability, dan gap.</span><ArrowRight size={18} /></a>
            <a href="/organization/nexa-research-lab/search?scope=projects"><FolderOpen size={30} /><strong>Cari proyek</strong><span>Proyek berdasarkan masalah, readiness, kebutuhan, dan evidence.</span><ArrowRight size={18} /></a>
          </div>
        </div>
      );
    }
    const resultScope: SearchScope = scope === "talent" ? "people" : "projects";
    const results = searchItems
      .filter((item) => item.scope === resultScope)
      .filter((item) => !q || `${item.title} ${item.summary} ${item.field}`.toLowerCase().includes(q.toLowerCase()))
      .filter((item) => !searchParams.get("field") || item.field === searchParams.get("field"))
      .filter((item) => scope !== "talent" || !searchParams.get("availability") || item.availability === searchParams.get("availability"))
      .filter((item) => scope !== "projects" || !searchParams.get("readiness") || item.readiness === searchParams.get("readiness"));
    const selectedItem = results.find((item) => item.slug === localSelected) ?? results[0];
    return (
      <div className="px-org-search">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Nexa Research Lab · {scope === "talent" ? "Cari talent" : "Cari proyek"}</p><h1>Bandingkan alasan, evidence, dan gap sebelum bertindak.</h1><p>Gunakan search bar pada Navbar di atas untuk pencarian organisasi.</p></div><a className="pl-button pl-button-secondary" href="/organization/nexa-research-lab/shortlists">Shared shortlists ({orgState.shortlists.length})</a></header>
        <div className="px-org-mobile-tabs" aria-label="Tahap pencarian organisasi">
          <button aria-controls="org-filter-panel" aria-pressed={mobilePanel === "filters"} className={mobilePanel === "filters" ? "active" : ""} onClick={() => setMobilePanel("filters")} type="button">Filter</button>
          <button aria-controls="org-result-panel" aria-pressed={mobilePanel === "results"} className={mobilePanel === "results" ? "active" : ""} onClick={() => setMobilePanel("results")} type="button">Hasil ({results.length})</button>
          <button aria-controls="org-detail-panel" aria-pressed={mobilePanel === "detail"} className={mobilePanel === "detail" ? "active" : ""} disabled={!selectedItem} onClick={() => setMobilePanel("detail")} type="button">Detail</button>
        </div>
        <div className="px-org-three-panel" data-mobile-panel={mobilePanel}>
          <aside className="px-filter-panel px-org-filter-panel" id="org-filter-panel">
            <div className="px-filter-title"><Faders size={20} /><strong>Kriteria</strong></div>
            <label><span>Bidang</span><select name="field" value={searchParams.get("field") ?? ""} onChange={(event) => { const next = new URLSearchParams(searchParams.toString()); event.target.value ? next.set("field", event.target.value) : next.delete("field"); next.delete("selected"); replaceQuery(next); }}><option value="">Semua bidang</option>{filterOptions.field.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>{scope === "talent" ? "Availability" : "Readiness"}</span><select value={searchParams.get(scope === "talent" ? "availability" : "readiness") ?? ""} onChange={(event) => { const key = scope === "talent" ? "availability" : "readiness"; const next = new URLSearchParams(searchParams.toString()); event.target.value ? next.set(key, event.target.value) : next.delete(key); next.delete("selected"); replaceQuery(next); }}><option value="">Semua</option><option value={scope === "talent" ? "AVAILABLE" : "PROTOTYPE"}>{scope === "talent" ? "AVAILABLE" : "PROTOTYPE"}</option></select></label>
            <div className="px-editable-criteria"><NotePencil size={18} /><strong>Kriteria dapat diedit</strong><p>Evidence relevan, lokasi fleksibel, dan satu gap diperbolehkan.</p></div>
          </aside>
          <section className="px-result-list px-org-result-panel" id="org-result-panel" aria-label="Hasil pencarian organisasi">
            {results.map((item) => {
              const next = new URLSearchParams(searchParams.toString());
              next.set("selected", item.slug);
              return <a className={`px-result-card${localSelected === item.slug ? " selected" : ""}`} href={`/organization/nexa-research-lab/search?${next}`} onClick={(e) => { e.preventDefault(); setLocalSelected(item.slug); replaceQuery(next); }} key={item.id}><div className="px-result-icon"><IconForScope scope={item.scope} /></div><div className="px-result-copy"><h3>{item.title}</h3><p>{item.owner}</p><div className="px-result-reason"><Sparkle size={15} />{item.reasons[0]}</div></div><ArrowRight size={17} /></a>;
            })}
          </section>
          {selectedItem ? (
            <aside className="px-search-detail px-org-detail-panel" id="org-detail-panel" aria-label={`Detail ${selectedItem.title}`}>
              <div className="px-detail-heading"><div className="px-result-icon large"><IconForScope scope={selectedItem.scope} /></div><div><Status tone="teal">MATCH</Status><h2>{selectedItem.title}</h2><p>{selectedItem.owner}</p></div></div>
              <section><h3>Alasan</h3><ul className="px-check-list">{selectedItem.reasons.map((value) => <li key={value}><CheckCircle size={18} weight="fill" />{value}</li>)}</ul></section>
              <section><h3>Evidence</h3>{selectedItem.evidence.map((value) => <div className="px-evidence-line" key={value}><ClipboardText size={17} />{value}</div>)}</section>
              <section className="px-gap-box"><h3>Gap</h3>{selectedItem.gaps.map((value) => <p key={value}><Info size={17} />{value}</p>)}</section>
              <div className="px-detail-actions">
                <button className="pl-button pl-button-primary" onClick={() => updateOrg({ shortlists: Array.from(new Set([...orgState.shortlists, selectedItem.slug])) }, `${selectedItem.title} ditambahkan ke shared shortlist.`)} type="button">{orgState.shortlists.includes(selectedItem.slug) ? "Sudah di shortlist ✓" : "Tambah ke shortlist"}</button>
                <button className="pl-button pl-button-secondary" onClick={() => updateOrg({ requestedInfo: Array.from(new Set([...orgState.requestedInfo, selectedItem.slug])) }, `Permintaan informasi untuk ${selectedItem.title} tersimpan.`)} type="button">{orgState.requestedInfo.includes(selectedItem.slug) ? "Informasi diminta ✓" : "Minta informasi"}</button>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    );
  }

  if (section === "shortlists") {
    const shortlisted = searchItems.filter((item) => orgState.shortlists.includes(item.slug));
    return (
      <div className="px-workspace-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Shared workspace</p><h1>Shortlists tim</h1><p>Reviewer, alasan, evidence, dan status tetap terlihat bersama.</p></div><a className="pl-button pl-button-primary" href="/organization/nexa-research-lab/search?scope=talent"><Plus size={17} /> Tambah kandidat</a></header>
        <div className="px-table" role="region" aria-label="Shared shortlist" tabIndex={0}>
          <div className="px-table-head"><span>Item</span><span>Alasan</span><span>Reviewer</span><span>Status</span></div>
          {shortlisted.map((item) => <div className="px-table-row" key={item.id}><span><strong>{item.title}</strong><small>{item.owner}</small></span><span>{item.reasons[0]}</span><span><label className="sr-only" htmlFor={`reviewer-${item.slug}`}>Reviewer untuk {item.title}</label><select id={`reviewer-${item.slug}`} value={orgState.reviewer} onChange={(event) => updateOrg({ reviewer: event.target.value }, `${event.target.value || "Reviewer"} ditetapkan untuk ${item.title}.`)}><option value="">Pilih reviewer</option><option>Dimas K.</option><option>Ayu Rahman</option></select></span><span><Status tone={orgState.reviewer ? "teal" : "warning"}>{orgState.reviewer ? "REVIEWING" : "UNASSIGNED"}</Status></span></div>)}
        </div>
      </div>
    );
  }

  if (section === "pipeline") {
    const stages = ["DISCOVERED", "REVIEWING", "CONTACTED", "WAITING", "ACCEPTED"];
    return (
      <div className="px-workspace-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Collaboration pipeline</p><h1>Gerakkan keputusan, bukan prospek penjualan.</h1><p>Pipeline dibatasi pada alur kolaborasi dan ownership reviewer.</p></div></header>
        <div className="px-pipeline" role="region" aria-label="Collaboration pipeline" tabIndex={0}>
          {stages.map((stage) => <section key={stage}><header><strong>{stage}</strong><Status>{orgState.pipelineStage === stage ? "1" : "0"}</Status></header>                {orgState.pipelineStage === stage ? (
                  <article>
                    <strong>{searchItems.find(i => orgState.shortlists.includes(i.slug))?.title ?? "Kandidat"} · Proyek Inovasi</strong>
                    <span>Reviewer: {orgState.reviewer || "Belum ditetapkan"}</span><Status tone={(orgState.decision ?? "PENDING") === "PENDING" ? "blue" : orgState.decision === "ACCEPTED" ? "teal" : "warning"}>{orgState.decision ?? "PENDING"}</Status><label>Pindahkan stage<select value={orgState.pipelineStage} onChange={(event) => updateOrg({ pipelineStage: event.target.value }, `Tahap pipeline berubah menjadi ${event.target.value}.`)}>{stages.map((value) => <option key={value}>{value}</option>)}</select></label><div><button type="button" onClick={() => updateOrg({ pipelineStage: "ACCEPTED", decision: "ACCEPTED" }, "Kolaborasi diterima dan dipindahkan ke tahap ACCEPTED.")}>Terima</button><button type="button" onClick={() => updateOrg({ pipelineStage: "WAITING" }, "Kolaborasi dipindahkan ke tahap WAITING.")}>Tunda</button><button type="button" onClick={() => updateOrg({ pipelineStage: "WAITING", decision: "DECLINED", notes: ["Kolaborasi ditolak dengan alasan tersimpan.", ...orgState.notes] }, "Kolaborasi ditolak. Alasan tersimpan di catatan.")}>Tolak</button></div></article>) : <div className="px-empty-slot">Belum ada item</div>}</section>)}
        </div>
        <section className="px-note-box"><h2>Catatan tim</h2><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const note = String(form.get("note") ?? ""); if (note) updateOrg({ notes: [...orgState.notes, note] }, "Catatan tim berhasil ditambahkan."); event.currentTarget.reset(); }}><label className="sr-only" htmlFor="pipeline-note">Catatan keputusan</label><input id="pipeline-note" name="note" placeholder="Tambahkan konteks keputusan" /><button className="pl-button pl-button-primary">Tambah catatan</button></form>{orgState.notes.map((note, index) => <p key={`${note}-${index}`}>{note}</p>)}</section>
      </div>
    );
  }

  if (section === "members") {
    return (
      <div className="px-workspace-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Anggota dan permission</p><h1>Akses mengikuti least privilege.</h1></div><button className="pl-button pl-button-primary" onClick={() => updateOrg({ memberInvited: true }, "Undangan anggota berhasil disiapkan.")}>{orgState.memberInvited ? "Undangan terkirim ✓" : "Undang anggota"}</button></header>
        <div className="px-table" role="region" aria-label="Daftar anggota organisasi" tabIndex={0}><div className="px-table-head"><span>Anggota</span><span>Role</span><span>Scope</span><span>Status</span></div>{[["Ayu Rahman","Organization Owner","Semua workspace"],["Dimas K.","Project Manager","2 proyek"],["Nadia Putri","Scout / Reviewer","Search + shortlist"],["Bagus A.","Billing Admin","Billing saja"]].map(([name,role,scopeValue])=><div className="px-table-row" key={name}><span><strong>{name}</strong></span><span>{role}</span><span>{scopeValue}</span><span><Status tone="teal">ACTIVE</Status></span></div>)}</div>
      </div>
    );
  }

  if (section === "billing") {
    return (
      <div className="px-workspace-page px-billing-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Area sekunder · Billing</p><h1>Organization plan</h1><p>Billing tidak mengubah urutan tugas utama dan tidak muncul di primary navbar.</p></div></header>
        <div className="px-public-grid"><section className="px-content-card"><Status tone="teal">ACTIVE</Status><h2>Organization</h2><p>Shared search, shortlists, pipeline, reviewer assignment, dan kapasitas tim.</p><div className="px-info-grid"><div><span>Billing owner</span><strong>Bagus A.</strong></div><div><span>Renewal</span><strong>19 Agustus 2026</strong></div></div></section><aside className="px-public-action"><WarningCircle size={26} /><h2>Billing mismatch recovery</h2><p>Jika entitlement belum sinkron, proyek, pipeline, dan tugas inti tetap dapat dibuka.</p><button className="pl-button pl-button-primary" onClick={() => updateOrg({ billingRefreshed: true }, "Billing berhasil disinkronkan.")}>{orgState.billingRefreshed ? "Billing tersinkron ✓" : "Refresh billing"}</button></aside></div>
      </div>
    );
  }

  if (section === "projects") {
    return (
      <div className="px-workspace-page"><header className="px-search-heading"><div><p className="pl-eyebrow">Organization projects</p><h1>Proyek dan peluang Nexa</h1></div><a className="pl-button pl-button-primary" href="/organization/nexa-research-lab/search?scope=projects"><MagnifyingGlass size={17} /> Cari inovasi</a></header><div className="px-result-list wide">{searchItems.filter((item) => item.scope === "projects").map((item) => <SearchResultCard key={item.id} item={item} selected={false} />)}</div></div>
    );
  }

  return null;
}
