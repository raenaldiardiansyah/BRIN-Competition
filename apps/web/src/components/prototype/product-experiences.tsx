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
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  filterLabels,
  filterOptions,
  scopeConfig,
  searchItems,
  type SearchItem,
  type SearchScope,
} from "@/dummy/registry";

function go(url: string) {
  window.location.assign(url);
}

function replaceQuery(next: URLSearchParams) {
  const query = next.toString();
  go(query ? `${window.location.pathname}?${query}` : window.location.pathname);
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
}: {
  item: SearchItem;
  selected: boolean;
}) {
  const params = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );
  params.set("selected", item.slug);
  return (
    <a
      className={`px-result-card${selected ? " selected" : ""}`}
      href={`/search?${params.toString()}`}
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

function SearchDetail({ item }: { item: SearchItem }) {
  const [saved, setSaved] = usePrototypeSession<string[]>("projectlink-saved-items", []);
  const isSaved = saved.includes(item.id);
  return (
    <aside className="px-search-detail" aria-label={`Detail ${item.title}`}>
      <div className="px-detail-heading">
        <div className="px-result-icon large"><IconForScope scope={item.scope} size={27} /></div>
        <div><Status tone="teal">{item.status}</Status><h2>{item.title}</h2><p>{item.owner}</p></div>
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
        <a className="pl-button pl-button-primary" href={item.href}>Buka detail <ArrowRight size={17} /></a>
        <button
          className="pl-button pl-button-secondary"
          onClick={() => setSaved(isSaved ? saved.filter((id) => id !== item.id) : [...saved, item.id])}
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
  const scope = (searchParams.get("scope") as SearchScope | null) ?? initialScope;
  const q = searchParams.get("q") ?? "";
  const selected = searchParams.get("selected");
  const sort = searchParams.get("sort") ?? "relevance";
  const prototypeState = searchParams.get("prototypeState");
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

  const activeFilters = activeConfig.filters
    .map((key) => [key, searchParams.get(key)] as const)
    .filter(([, value]) => Boolean(value));

  const results = searchItems
    .filter((item) => item.scope === scope)
    .filter((item) => {
      const haystack = `${item.title} ${item.owner} ${item.summary} ${item.field} ${item.location}`.toLowerCase();
      return !q || haystack.includes(q.toLowerCase());
    })
    .filter((item) => activeFilters.every(([key, value]) => {
      if (key === "field") return item.field === value;
      if (key === "readiness") return item.readiness === value;
      if (key === "availability") return item.availability === value;
      if (key === "location") return item.location === value;
      if (key === "status") return item.status === value;
      return true;
    }));
  const selectedItem = results.find((item) => item.slug === selected);

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
    replaceQuery(next);
  };

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    next.delete("selected");
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
          <p>Query, filter, urutan, dan pilihan tersimpan di URL.</p>
        </div>
        <a className="pl-button pl-button-secondary" href={saveHref}>Simpan pencarian</a>
      </header>
      {searchParams.get("saved") === "1" ? (
        <div className="px-save-banner" role="status"><CheckCircle size={19} weight="fill" /> Pencarian tersimpan. Query dan filter tetap sama setelah autentikasi.</div>
      ) : null}

      <form className="px-search-command" action="/search" method="get">
        <label>
          <span>Scope</span>
          <select value={scope} onChange={(event) => changeScope(event.target.value as SearchScope)}>
            {(Object.keys(scopeConfig) as SearchScope[]).map((value) => <option value={value} key={value}>{scopeConfig[value].label}</option>)}
          </select>
        </label>
        <input name="scope" type="hidden" value={scope} />
        <label className="px-query-field">
          <span>Kata kunci</span>
          <span><MagnifyingGlass size={20} /><input defaultValue={q} name="q" placeholder={activeConfig.queryPlaceholder} /></span>
        </label>
        <button className="pl-button pl-button-primary" type="submit">Cari</button>
      </form>

      <div className="px-active-filter-row">
        <span>{results.length} hasil</span>
        {activeFilters.map(([key, value]) => (
          <button onClick={() => clearFilter(key)} type="button" key={key}>
            {filterLabels[key]}: {value} <X size={14} />
          </button>
        ))}
        {activeFilters.length ? (
          <button className="clear" onClick={() => {
            const next = new URLSearchParams();
            next.set("scope", scope);
            if (q) next.set("q", q);
            replaceQuery(next);
          }} type="button">Hapus semua</button>
        ) : null}
      </div>

      <div className="px-search-layout">
        <aside className="px-filter-panel">
          <div className="px-filter-title"><Faders size={20} /><strong>Filter</strong></div>
          {activeConfig.filters.map((key) => (
            <label key={key}>
              <span>{filterLabels[key]}</span>
              <select
                value={searchParams.get(key) ?? ""}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams.toString());
                  event.target.value ? next.set(key, event.target.value) : next.delete(key);
                  next.delete("selected");
                  replaceQuery(next);
                }}
              >
                <option value="">Semua</option>
                {filterOptions[key].map((value) => <option value={value} key={value}>{value}</option>)}
              </select>
            </label>
          ))}
          <label>
            <span>Urutkan</span>
            <select
              value={sort}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams.toString());
                event.target.value === "relevance" ? next.delete("sort") : next.set("sort", event.target.value);
                replaceQuery(next);
              }}
            >
              {activeConfig.sorts.map((value) => <option value={value} key={value}>{value === "relevance" ? "Paling relevan" : value}</option>)}
            </select>
          </label>
        </aside>

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
            results.map((item) => <SearchResultCard item={item} selected={selected === item.slug} key={item.id} />)
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
              <a className="pl-button pl-button-primary" href={`/search?scope=${scope}${q ? `&q=${encodeURIComponent(q)}` : ""}`}>Perluas pencarian</a>
              <a className="pl-button pl-button-secondary" href={saveHref}>Simpan setelah masuk</a>
            </div>
          )}
        </section>
        {selectedItem ? <SearchDetail item={selectedItem} /> : null}
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

export function PublicEntityExperience({
  scope,
  slug,
}: {
  scope: SearchScope;
  slug: string;
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
  const returnTo = item.href;
  const action = scope === "opportunities" ? "apply-opportunity" : scope === "people" ? "start-collaboration" : "save-item";
  const authHref = `/login?returnTo=${encodeURIComponent(returnTo)}&action=${action}`;
  return (
    <div className="px-public-page">
      <PublicHero item={item} />
      <div className="px-public-grid">
        <main>
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
            <div className="px-verification"><ShieldCheck size={24} weight="duotone" /><div><strong>{item.verification}</strong><span>Scope verifikasi selalu dijelaskan; tidak menjadi klaim menyeluruh.</span></div></div>
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
        </main>
        <aside className="px-public-action">
          <Status tone="blue">{item.verification}</Status>
          <h2>Tindakan berikutnya</h2>
          <p>{scope === "people" ? "Mulai permintaan kolaborasi dengan konteks proyek." : scope === "organizations" ? "Lihat peluang atau ajukan kolaborasi terstruktur." : scope === "opportunities" ? "Tinjau kebutuhan sebelum mengajukan kontribusi." : "Simpan atau mulai kolaborasi pada proyek ini."}</p>
          <a className="pl-button pl-button-primary" href={authHref}>{scope === "opportunities" ? "Ajukan kontribusi" : "Mulai kolaborasi"}</a>
          <a className="pl-button pl-button-secondary" href={`/search?scope=${scope}`}>Lihat yang serupa</a>
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
  const [orgState, setOrgState] = usePrototypeSession<OrgState>("projectlink-org-state", initialOrgState);
  const scope = searchParams.get("scope");
  const q = searchParams.get("q") ?? "";
  const selected = searchParams.get("selected");
  const [mobilePanel, setMobilePanel] = useState<"filters" | "results" | "detail">(selected ? "detail" : "results");
  const updateOrg = (patch: Partial<OrgState>) => setOrgState({ ...orgState, ...patch });

  useEffect(() => {
    if (selected) setMobilePanel("detail");
  }, [selected]);

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
    const selectedItem = results.find((item) => item.slug === selected) ?? results[0];
    return (
      <div className="px-org-search">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Nexa Research Lab · {scope === "talent" ? "Cari talent" : "Cari proyek"}</p><h1>Bandingkan alasan, evidence, dan gap sebelum bertindak.</h1></div><a className="pl-button pl-button-secondary" href="/organization/nexa-research-lab/shortlists">Shared shortlists ({orgState.shortlists.length})</a></header>
        <form className="px-search-command" action="/organization/nexa-research-lab/search">
          <input name="scope" type="hidden" value={scope} />
          <label className="px-query-field"><span>Masalah atau kebutuhan</span><span><MagnifyingGlass size={20} /><input defaultValue={q} name="q" placeholder={scope === "talent" ? "Contoh: computer vision untuk inspeksi termal" : "Contoh: predictive maintenance motor industri"} /></span></label>
          <button className="pl-button pl-button-primary" type="submit">Cari</button>
        </form>
        <div className="px-org-mobile-tabs" aria-label="Tahap pencarian organisasi">
          <button className={mobilePanel === "filters" ? "active" : ""} onClick={() => setMobilePanel("filters")} type="button">Filter</button>
          <button className={mobilePanel === "results" ? "active" : ""} onClick={() => setMobilePanel("results")} type="button">Hasil ({results.length})</button>
          <button className={mobilePanel === "detail" ? "active" : ""} disabled={!selectedItem} onClick={() => setMobilePanel("detail")} type="button">Detail</button>
        </div>
        <div className="px-org-three-panel" data-mobile-panel={mobilePanel}>
          <aside className="px-filter-panel px-org-filter-panel">
            <div className="px-filter-title"><Faders size={20} /><strong>Kriteria</strong></div>
            <label><span>Bidang</span><select name="field" value={searchParams.get("field") ?? ""} onChange={(event) => { const next = new URLSearchParams(searchParams.toString()); event.target.value ? next.set("field", event.target.value) : next.delete("field"); next.delete("selected"); replaceQuery(next); }}><option value="">Semua bidang</option>{filterOptions.field.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>{scope === "talent" ? "Availability" : "Readiness"}</span><select value={searchParams.get(scope === "talent" ? "availability" : "readiness") ?? ""} onChange={(event) => { const key = scope === "talent" ? "availability" : "readiness"; const next = new URLSearchParams(searchParams.toString()); event.target.value ? next.set(key, event.target.value) : next.delete(key); next.delete("selected"); replaceQuery(next); }}><option value="">Semua</option><option value={scope === "talent" ? "AVAILABLE" : "PROTOTYPE"}>{scope === "talent" ? "AVAILABLE" : "PROTOTYPE"}</option></select></label>
            <div className="px-editable-criteria"><NotePencil size={18} /><strong>Kriteria dapat diedit</strong><p>Evidence relevan, lokasi fleksibel, dan satu gap diperbolehkan.</p></div>
          </aside>
          <section className="px-result-list px-org-result-panel">
            {results.map((item) => {
              const next = new URLSearchParams(searchParams.toString());
              next.set("selected", item.slug);
              return <a className={`px-result-card${selectedItem?.slug === item.slug ? " selected" : ""}`} href={`/organization/nexa-research-lab/search?${next}`} key={item.id}><div className="px-result-icon"><IconForScope scope={item.scope} /></div><div className="px-result-copy"><h3>{item.title}</h3><p>{item.owner}</p><div className="px-result-reason"><Sparkle size={15} />{item.reasons[0]}</div></div><ArrowRight size={17} /></a>;
            })}
          </section>
          {selectedItem ? (
            <aside className="px-search-detail px-org-detail-panel">
              <div className="px-detail-heading"><div className="px-result-icon large"><IconForScope scope={selectedItem.scope} /></div><div><Status tone="teal">MATCH</Status><h2>{selectedItem.title}</h2><p>{selectedItem.owner}</p></div></div>
              <section><h3>Alasan</h3><ul className="px-check-list">{selectedItem.reasons.map((value) => <li key={value}><CheckCircle size={18} weight="fill" />{value}</li>)}</ul></section>
              <section><h3>Evidence</h3>{selectedItem.evidence.map((value) => <div className="px-evidence-line" key={value}><ClipboardText size={17} />{value}</div>)}</section>
              <section className="px-gap-box"><h3>Gap</h3>{selectedItem.gaps.map((value) => <p key={value}><Info size={17} />{value}</p>)}</section>
              <div className="px-detail-actions">
                <button className="pl-button pl-button-primary" onClick={() => updateOrg({ shortlists: Array.from(new Set([...orgState.shortlists, selectedItem.slug])) })} type="button">{orgState.shortlists.includes(selectedItem.slug) ? "Sudah di shortlist ✓" : "Tambah ke shortlist"}</button>
                <button className="pl-button pl-button-secondary" onClick={() => updateOrg({ requestedInfo: Array.from(new Set([...orgState.requestedInfo, selectedItem.slug])) })} type="button">{orgState.requestedInfo.includes(selectedItem.slug) ? "Informasi diminta ✓" : "Minta informasi"}</button>
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
        <div className="px-table">
          <div className="px-table-head"><span>Item</span><span>Alasan</span><span>Reviewer</span><span>Status</span></div>
          {shortlisted.map((item) => <div className="px-table-row" key={item.id}><span><strong>{item.title}</strong><small>{item.owner}</small></span><span>{item.reasons[0]}</span><span><select value={orgState.reviewer} onChange={(event) => updateOrg({ reviewer: event.target.value })}><option value="">Pilih reviewer</option><option>Dimas K.</option><option>Ayu Rahman</option></select></span><span><Status tone={orgState.reviewer ? "teal" : "warning"}>{orgState.reviewer ? "REVIEWING" : "UNASSIGNED"}</Status></span></div>)}
        </div>
      </div>
    );
  }

  if (section === "pipeline") {
    const stages = ["DISCOVERED", "REVIEWING", "CONTACTED", "WAITING", "ACCEPTED"];
    return (
      <div className="px-workspace-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Collaboration pipeline</p><h1>Gerakkan keputusan, bukan prospek penjualan.</h1><p>Pipeline dibatasi pada alur kolaborasi dan ownership reviewer.</p></div></header>
        <div className="px-pipeline">
          {stages.map((stage) => <section key={stage}><header><strong>{stage}</strong><Status>{orgState.pipelineStage === stage ? "1" : "0"}</Status></header>{orgState.pipelineStage === stage ? <article><strong>Maya Pradipta · Urban Heat Pilot</strong><span>Reviewer: {orgState.reviewer || "Belum ditetapkan"}</span><Status tone={(orgState.decision ?? "PENDING") === "PENDING" ? "blue" : orgState.decision === "ACCEPTED" ? "teal" : "warning"}>{orgState.decision ?? "PENDING"}</Status><label>Pindahkan stage<select value={orgState.pipelineStage} onChange={(event) => updateOrg({ pipelineStage: event.target.value })}>{stages.map((value) => <option key={value}>{value}</option>)}</select></label><div><button onClick={() => updateOrg({ pipelineStage: "ACCEPTED", decision: "ACCEPTED" })}>Terima</button><button onClick={() => updateOrg({ pipelineStage: "WAITING" })}>Tunda</button><button onClick={() => updateOrg({ pipelineStage: "WAITING", decision: "DECLINED", notes: ["Kolaborasi ditolak dengan alasan tersimpan.", ...orgState.notes] })}>Tolak</button></div></article> : <div className="px-empty-slot">Belum ada item</div>}</section>)}
        </div>
        <section className="px-note-box"><h2>Catatan tim</h2><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const note = String(form.get("note") ?? ""); if (note) updateOrg({ notes: [...orgState.notes, note] }); event.currentTarget.reset(); }}><input name="note" placeholder="Tambahkan konteks keputusan" /><button className="pl-button pl-button-primary">Tambah catatan</button></form>{orgState.notes.map((note, index) => <p key={`${note}-${index}`}>{note}</p>)}</section>
      </div>
    );
  }

  if (section === "members") {
    return (
      <div className="px-workspace-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Anggota dan permission</p><h1>Akses mengikuti least privilege.</h1></div><button className="pl-button pl-button-primary" onClick={() => updateOrg({ memberInvited: true })}>{orgState.memberInvited ? "Undangan terkirim ✓" : "Undang anggota"}</button></header>
        <div className="px-table"><div className="px-table-head"><span>Anggota</span><span>Role</span><span>Scope</span><span>Status</span></div>{[["Ayu Rahman","Organization Owner","Semua workspace"],["Dimas K.","Project Manager","2 proyek"],["Nadia Putri","Scout / Reviewer","Search + shortlist"],["Bagus A.","Billing Admin","Billing saja"]].map(([name,role,scopeValue])=><div className="px-table-row" key={name}><span><strong>{name}</strong></span><span>{role}</span><span>{scopeValue}</span><span><Status tone="teal">ACTIVE</Status></span></div>)}</div>
      </div>
    );
  }

  if (section === "billing") {
    return (
      <div className="px-workspace-page px-billing-page">
        <header className="px-search-heading"><div><p className="pl-eyebrow">Area sekunder · Billing</p><h1>Organization plan</h1><p>Billing tidak mengubah urutan tugas utama dan tidak muncul di primary navbar.</p></div></header>
        <div className="px-public-grid"><section className="px-content-card"><Status tone="teal">ACTIVE</Status><h2>Organization</h2><p>Shared search, shortlists, pipeline, reviewer assignment, dan kapasitas tim.</p><div className="px-info-grid"><div><span>Billing owner</span><strong>Bagus A.</strong></div><div><span>Renewal</span><strong>19 Agustus 2026</strong></div></div></section><aside className="px-public-action"><WarningCircle size={26} /><h2>Billing mismatch recovery</h2><p>Jika entitlement belum sinkron, proyek, pipeline, dan tugas inti tetap dapat dibuka.</p><button className="pl-button pl-button-primary" onClick={() => updateOrg({ billingRefreshed: true })}>{orgState.billingRefreshed ? "Billing tersinkron ✓" : "Refresh billing"}</button></aside></div>
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
