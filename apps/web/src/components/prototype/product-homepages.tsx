"use client";

import {
  ArrowRight,
  Buildings,
  CheckCircle,
  ClipboardText,
  Code,
  Compass,
  FolderOpen,
  Handshake,
  Lightbulb,
  LinkSimple,
  MagnifyingGlass,
  MapPin,
  Medal,
  Plus,
  RocketLaunch,
  Sparkle,
  Target,
  TrendUp,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type HomeProps = {
  onFirstValue?: () => void;
  onHideRecommendation?: () => void;
  recommendationHidden?: boolean;
};

function Anchor({
  href,
  children,
  className = "pl-button pl-button-secondary",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="pl-section-title">
      <div>
        {eyebrow ? <p className="pl-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

function ProjectPreview({
  title,
  organization,
  stage,
  tags,
  tone = "blue",
}: {
  title: string;
  organization: string;
  stage: string;
  tags: string[];
  tone?: "blue" | "teal" | "navy";
}) {
  return (
    <article className="pl-project-card">
      <div className={`pl-project-visual ${tone}`}>
        <FolderOpen size={28} weight="duotone" />
        <span>{stage}</span>
      </div>
      <div className="pl-project-body">
        <div className="pl-project-org">
          <span className="pl-avatar">{organization.slice(0, 2).toUpperCase()}</span>
          <span>{organization}</span>
        </div>
        <h3>{title}</h3>
        <p>
          Kebutuhan, kontribusi, dan evidence diringkas agar keputusan kolaborasi
          lebih cepat.
        </p>
        <div className="pl-tag-row">
          {tags.map((tag) => (
            <span className="pl-tag" key={tag}>{tag}</span>
          ))}
        </div>
        <a className="pl-inline-link" href="/projects/aqua-loop">
          Lihat proyek <ArrowRight size={16} weight="bold" />
        </a>
      </div>
    </article>
  );
}

export function GuestHome() {
  const goals = [
    {
      icon: <Compass size={25} weight="duotone" />,
      title: "Temukan proyek",
      text: "Jelajahi masalah nyata dan peluang kontribusi yang relevan.",
      href: "/search?scope=projects",
    },
    {
      icon: <FolderOpen size={25} weight="duotone" />,
      title: "Tampilkan proyek",
      text: "Buka kebutuhan tim dan tunjukkan progres dengan evidence.",
      href: "/register?goal=show-project",
    },
    {
      icon: <UsersThree size={25} weight="duotone" />,
      title: "Cari kolaborator",
      text: "Temukan orang berdasarkan kecocokan kontribusi, bukan jabatan.",
      href: "/search?scope=people",
    },
    {
      icon: <Handshake size={25} weight="duotone" />,
      title: "Bangun kemitraan",
      text: "Hubungkan organisasi dengan proyek dan talenta yang dapat diperiksa.",
      href: "/search?scope=organizations",
    },
  ];

  return (
    <div className="pl-home pl-guest-home">
      <section className="pl-hero">
        <div className="pl-hero-copy">
          <span className="pl-kicker"><Sparkle size={16} weight="fill" /> Jaringan inovasi berbasis bukti</span>
          <h1>Temukan orang dan proyek yang tepat untuk membuat dampak nyata.</h1>
          <p>
            ProjectLink menghubungkan kebutuhan proyek, kontribusi terverifikasi,
            dan alasan kecocokan dalam satu ruang kolaborasi.
          </p>
          <div className="pl-button-row">
            <Anchor href="/explore" className="pl-button pl-button-primary">
              Jelajahi sekarang <ArrowRight size={18} weight="bold" />
            </Anchor>
            <Anchor href="/register">Bangun profil proyek</Anchor>
          </div>
          <div className="pl-trust-line">
            <span><CheckCircle size={17} weight="fill" /> Evidence yang dapat diperiksa</span>
            <span><CheckCircle size={17} weight="fill" /> Matching yang dapat dijelaskan</span>
          </div>
        </div>
        <div className="pl-hero-graphic" aria-label="Alur ProjectLink dari proyek menuju kolaborasi">
          <div className="pl-graphic-card card-a">
            <FolderOpen size={30} weight="duotone" />
            <strong>Proyek</strong>
            <span>Kebutuhan yang jelas</span>
          </div>
          <div className="pl-graphic-card card-b">
            <Medal size={30} weight="duotone" />
            <strong>Evidence</strong>
            <span>Kontribusi terukur</span>
          </div>
          <div className="pl-graphic-card card-c">
            <Handshake size={30} weight="duotone" />
            <strong>Kolaborasi</strong>
            <span>Kecocokan beralasan</span>
          </div>
          <div className="pl-graphic-link" />
        </div>
      </section>

      <section className="pl-section">
        <SectionTitle
          eyebrow="Mulai dari tujuan"
          title="Apa yang ingin Anda capai?"
          description="Pilih jalur yang paling dekat dengan kebutuhan Anda hari ini."
        />
        <div className="pl-goal-grid">
          {goals.map((goal) => (
            <a className="pl-goal-card" href={goal.href} key={goal.title}>
              <span className="pl-icon-box">{goal.icon}</span>
              <h3>{goal.title}</h3>
              <p>{goal.text}</p>
              <span className="pl-inline-link">Mulai <ArrowRight size={16} weight="bold" /></span>
            </a>
          ))}
        </div>
      </section>

      <section className="pl-section">
        <SectionTitle
          eyebrow="Proyek pilihan"
          title="Lihat peluang yang sedang bergerak"
          action={<Anchor href="/explore" className="pl-text-action">Lihat semua <ArrowRight size={17} /></Anchor>}
        />
        <div className="pl-project-grid">
          <ProjectPreview title="AquaLoop: Pemantauan kualitas air terbuka" organization="BRIN Lab" stage="PILOT" tags={["Data lingkungan", "IoT"]} />
          <ProjectPreview title="Urban Heat Mapping untuk kota tangguh" organization="Nexa Research Lab" stage="RESEARCH" tags={["Geospatial", "Climate"]} tone="teal" />
          <ProjectPreview title="Rantai dingin hasil tani berbasis sensor" organization="Agri Nexus" stage="VALIDATION" tags={["Supply chain", "Hardware"]} tone="navy" />
        </div>
      </section>

      <section className="pl-feature-split pl-section">
        <div className="pl-feature-copy">
          <span className="pl-icon-box"><Medal size={26} weight="duotone" /></span>
          <p className="pl-eyebrow">Kontribusi yang terlihat</p>
          <h2>Portofolio yang menjelaskan apa yang benar-benar Anda kerjakan.</h2>
          <p>
            Hubungkan peran, output, dan bukti pada proyek. Orang lain dapat
            memahami konteks kontribusi tanpa menebak dari judul pekerjaan.
          </p>
          <Anchor href="/profiles/maya">Lihat contoh profil</Anchor>
        </div>
        <div className="pl-evidence-card">
          <div className="pl-person-row">
            <span className="pl-avatar large">MP</span>
            <div><strong>Maya Pradipta</strong><span>Data Engineer · Bandung</span></div>
            <span className="pl-status success">Terverifikasi</span>
          </div>
          <div className="pl-evidence-block">
            <Code size={24} weight="duotone" />
            <div>
              <strong>Pipeline validasi data sensor</strong>
              <span>AquaLoop · 38% data lebih cepat diproses</span>
            </div>
          </div>
          <div className="pl-proof-row">
            <span><LinkSimple size={16} /> Repository</span>
            <span><ClipboardText size={16} /> Catatan pengujian</span>
          </div>
        </div>
      </section>

      <section className="pl-match-demo pl-section">
        <div className="pl-match-score">
          <span>86%</span>
          <strong>Kecocokan kuat</strong>
          <small>berdasarkan 5 sinyal</small>
        </div>
        <div className="pl-match-copy">
          <p className="pl-eyebrow">Matching yang transparan</p>
          <h2>Anda selalu dapat melihat mengapa sebuah rekomendasi muncul.</h2>
          <ul className="pl-check-list">
            <li><CheckCircle size={19} weight="fill" /> 3 kebutuhan proyek cocok dengan evidence</li>
            <li><CheckCircle size={19} weight="fill" /> Lokasi dan ketersediaan sesuai</li>
            <li><CheckCircle size={19} weight="fill" /> 1 gap kompetensi ditampilkan terbuka</li>
          </ul>
          <Anchor href="/matches/aqua-maya" className="pl-button pl-button-primary">Lihat contoh alasan</Anchor>
        </div>
      </section>

      <section className="pl-section">
        <SectionTitle eyebrow="Cara kerja" title="Dari kebutuhan menuju kolaborasi" />
        <div className="pl-steps">
          {[
            ["01", "Tentukan tujuan", "Ceritakan kebutuhan atau arah kontribusi Anda."],
            ["02", "Tunjukkan evidence", "Hubungkan pekerjaan dengan output yang dapat diperiksa."],
            ["03", "Nilai kecocokan", "Bandingkan alasan, gap, dan kesiapan bersama."],
            ["04", "Mulai kolaborasi", "Bawa keputusan ke workspace dengan konteks utuh."],
          ].map(([number, title, text]) => (
            <div key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </section>

      <section className="pl-final-cta">
        <div>
          <p className="pl-eyebrow">Mulai dengan konteks yang tepat</p>
          <h2>Kolaborasi yang baik dimulai dari bukti yang jelas.</h2>
        </div>
        <div className="pl-button-row">
          <Anchor href="/register" className="pl-button pl-button-light">Bergabung sekarang</Anchor>
          <Anchor href="/explore" className="pl-button pl-button-on-dark">Jelajahi proyek</Anchor>
        </div>
      </section>
    </div>
  );
}

export function NewUserHome({ onFirstValue }: HomeProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState("find-project");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [goalDrafts, setGoalDrafts] = useState<Record<string, { title: string; problem: string }>>({
    "show-project": { title: "", problem: "" },
    "find-project": { title: "Pemetaan kualitas air komunitas", problem: "Data kualitas air lokal belum mudah dibaca dan dibandingkan." },
    "find-member": { title: "", problem: "" },
    "find-talent-or-innovation": { title: "", problem: "" },
    "publish-opportunity": { title: "", problem: "" },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("projectlink-goal-drafts");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { activeGoal?: string; drafts?: typeof goalDrafts };
        if (parsed.activeGoal) setActiveGoal(parsed.activeGoal);
        if (parsed.drafts) setGoalDrafts(parsed.drafts);
      } catch {
        // Stable defaults remain available when stored prototype data is invalid.
      }
    }
  }, []);

  const updateGoalDraft = (patch: Partial<{ title: string; problem: string }>) => {
    const nextDrafts = {
      ...goalDrafts,
      [activeGoal]: { ...goalDrafts[activeGoal], ...patch },
    };
    setGoalDrafts(nextDrafts);
    sessionStorage.setItem("projectlink-goal-drafts", JSON.stringify({ activeGoal, drafts: nextDrafts }));
    setDraftSaved(false);
  };

  const changeGoal = (nextGoal: string) => {
    setActiveGoal(nextGoal);
    sessionStorage.setItem("projectlink-goal-drafts", JSON.stringify({ activeGoal: nextGoal, drafts: goalDrafts }));
    setWorkspaceOpen(false);
    setPreviewOpen(false);
  };

  return (
    <div className="pl-home pl-dashboard">
      <section className="pl-welcome">
        <div>
          <p className="pl-eyebrow">Beranda personal</p>
          <h1>Selamat datang, Maya. Mari wujudkan nilai pertama Anda.</h1>
          <p>Kami menyederhanakan langkah awal agar profil Anda segera berguna.</p>
        </div>
        <label className="pl-goal-select">
          <span>Tujuan aktif</span>
          <select value={activeGoal} onChange={(event) => changeGoal(event.target.value)}>
            <option value="find-project">Menemukan proyek</option>
            <option value="show-project">Menampilkan proyek</option>
            <option value="find-member">Mencari anggota tim</option>
            <option value="find-talent-or-innovation">Mencari talent atau inovasi</option>
            <option value="publish-opportunity">Menerbitkan peluang</option>
          </select>
        </label>
      </section>

      <section className="pl-onboarding-grid">
        <div className="pl-next-card">
          <span className="pl-kicker"><RocketLaunch size={16} weight="fill" /> Langkah berikutnya</span>
          <h2>{activeGoal === "find-project" ? "Bangun konteks agar rekomendasi proyek lebih relevan." : activeGoal === "show-project" ? "Buat workspace proyek pertama Anda." : activeGoal === "publish-opportunity" ? "Susun peluang dengan kontribusi yang jelas." : "Jelaskan kebutuhan kolaborasi Anda."}</h2>
          <p>Input untuk setiap tujuan disimpan terpisah. Anda dapat berganti tujuan tanpa kehilangan draft.</p>
          <div className="pl-progress"><span style={{ width: "40%" }} /></div>
          <span className="pl-progress-label">2 dari 5 dasar profil sudah siap</span>
          <button className="pl-button pl-button-primary" onClick={() => setWorkspaceOpen(true)} type="button">
            <Plus size={18} weight="bold" /> Buat workspace
          </button>
        </div>
        <aside className="pl-benefit-card">
          <span className="pl-icon-box"><Target size={25} weight="duotone" /></span>
          <h3>Mengapa langkah ini penting?</h3>
          <p>Workspace memberi konteks untuk rekomendasi proyek, orang, dan evidence.</p>
          <ul>
            <li>Rekomendasi lebih relevan</li>
            <li>Kontribusi mudah dihubungkan</li>
            <li>Tim memahami kebutuhan Anda</li>
          </ul>
        </aside>
      </section>

      {workspaceOpen ? (
        <section className="pl-inline-create" aria-live="polite">
          <div>
            <p className="pl-eyebrow">Workspace baru</p>
            <h2>Mulai dari satu kalimat masalah.</h2>
          </div>
          <label>
            Nama proyek
            <input value={goalDrafts[activeGoal]?.title ?? ""} onChange={(event) => updateGoalDraft({ title: event.target.value })} />
          </label>
          <label>
            Masalah yang ingin diselesaikan
            <textarea value={goalDrafts[activeGoal]?.problem ?? ""} onChange={(event) => updateGoalDraft({ problem: event.target.value })} />
          </label>
          <div className="pl-button-row">
            <button className="pl-button pl-button-primary" onClick={() => {
              sessionStorage.setItem("projectlink-goal-drafts", JSON.stringify({ activeGoal, drafts: goalDrafts }));
              setDraftSaved(true);
              setPreviewOpen(true);
            }} type="button">
              Simpan draft dan preview <ArrowRight size={18} />
            </button>
            <button className="pl-button pl-button-ghost" onClick={() => setWorkspaceOpen(false)} type="button">Nanti saja</button>
          </div>
        </section>
      ) : null}

      {previewOpen ? (
        <section className="pl-inline-create pl-publish-preview" aria-live="polite">
          <div><p className="pl-eyebrow">Preview sebelum publikasi</p><h2>{goalDrafts[activeGoal]?.title || "Judul belum diisi"}</h2><p>{goalDrafts[activeGoal]?.problem || "Masalah belum dijelaskan."}</p></div>
          <div className="pl-preview-checks"><span><CheckCircle size={18} weight="fill" /> Draft tersimpan untuk tujuan ini</span><span><CheckCircle size={18} weight="fill" /> AI suggestion tetap dapat diedit</span><span><CheckCircle size={18} weight="fill" /> Belum dipublikasikan</span></div>
          <div className="pl-button-row">
            <button className="pl-button pl-button-primary" onClick={() => {
              sessionStorage.setItem("projectlink-first-value", "true");
              onFirstValue?.();
            }} type="button">Publikasikan nilai pertama</button>
            <button className="pl-button pl-button-secondary" onClick={() => setPreviewOpen(false)} type="button">Kembali edit</button>
          </div>
          {draftSaved ? <span className="pl-save-feedback">Draft tersimpan di sesi prototype.</span> : null}
        </section>
      ) : null}

      <section className="pl-section">
        <SectionTitle eyebrow="Rekomendasi awal" title="Tiga titik awal yang sesuai dengan tujuan Anda" description="Rekomendasi masih bersifat eksploratif sampai evidence Anda bertambah." />
        <div className="pl-recommendation-grid">
          <ProjectPreview title="AquaLoop: Pemantauan kualitas air terbuka" organization="BRIN Lab" stage="PILOT" tags={["Data", "Environment"]} />
          <ProjectPreview title="Open Sensor Calibration Library" organization="Nexa Research Lab" stage="BUILDING" tags={["Python", "IoT"]} tone="teal" />
          <div className="pl-empty-project-card">
            <Lightbulb size={34} weight="duotone" />
            <h3>Punya proyek sendiri?</h3>
            <p>Buat ruang kerja ringan, lalu undang kolaborator setelah konteks dasarnya siap.</p>
            <button onClick={() => setWorkspaceOpen(true)} type="button">Buat proyek <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ReturningUserHome({
  onHideRecommendation,
  recommendationHidden,
}: HomeProps) {
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [savedMatches, setSavedMatches] = useState<string[]>([]);

  useEffect(() => {
    try {
      setCompletedActions(JSON.parse(sessionStorage.getItem("projectlink-completed-actions") ?? "[]") as string[]);
      setActivities(JSON.parse(sessionStorage.getItem("projectlink-activity") ?? "[]") as string[]);
      setRejectionCount(Number(sessionStorage.getItem("projectlink-rejection-count") ?? "0"));
      setSavedMatches(JSON.parse(sessionStorage.getItem("projectlink-saved-matches") ?? "[]") as string[]);
    } catch {
      setCompletedActions([]);
    }
  }, []);

  const completeAction = (id: string, activity: string) => {
    const nextActions = Array.from(new Set([...completedActions, id]));
    const nextActivity = [activity, ...activities];
    setCompletedActions(nextActions);
    setActivities(nextActivity);
    setSelectedAction(null);
    sessionStorage.setItem("projectlink-completed-actions", JSON.stringify(nextActions));
    sessionStorage.setItem("projectlink-activity", JSON.stringify(nextActivity));
  };

  const pendingActions = [
    ["contribution", "Konfirmasi kontribusi", "AquaLoop meminta persetujuan output pipeline.", "Konfirmasi"],
    ["invitation", "Balas undangan", "Nexa Research Lab mengundang Anda ke pilot baru.", "Undangan"],
    ["evidence", "Lengkapi evidence", "Satu output belum memiliki tautan bukti.", "Evidence"],
  ].filter(([id]) => !completedActions.includes(id));

  return (
    <div className="pl-home pl-dashboard">
      <section className="pl-welcome pl-welcome-returning">
        <div>
          <p className="pl-eyebrow">Minggu ini di ProjectLink</p>
          <h1>Selamat datang kembali, Maya.</h1>
          <p>{pendingActions.length ? `Ada ${pendingActions.length} hal yang layak Anda tinjau sebelum melanjutkan pekerjaan.` : "Semua tindakan utama sudah selesai."}</p>
        </div>
        <Anchor href="/notifications" className="pl-button pl-button-primary">Tinjau semua tindakan</Anchor>
      </section>

      {pendingActions.length ? <section className="pl-action-grid">
        {pendingActions.map(([id, title, text, label], index) => (
          <article className="pl-action-card" key={id}>
            <span className={`pl-priority ${index === 0 ? "high" : ""}`}>{label}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <button onClick={() => setSelectedAction(id)} type="button">Tinjau <ArrowRight size={16} /></button>
          </article>
        ))}
      </section> : (
        <section className="pl-all-complete"><CheckCircle size={38} weight="duotone" /><div><p className="pl-eyebrow">Semua selesai</p><h2>Tidak ada tugas yang menunggu.</h2><p>Lanjutkan proyek aktif atau buka discovery ringan tanpa urgency buatan.</p></div><div className="pl-button-row"><Anchor href="/projects/aqua-loop/manage" className="pl-button pl-button-primary">Kembali ke proyek</Anchor><Anchor href="/collaboration">Buka kolaborasi</Anchor></div></section>
      )}

      {selectedAction ? (
        <section className="pl-action-expanded" aria-live="polite">
          <div><p className="pl-eyebrow">Action required</p><h2>{pendingActions.find(([id]) => id === selectedAction)?.[1]}</h2><p>{pendingActions.find(([id]) => id === selectedAction)?.[2]}</p></div>
          {selectedAction === "contribution" ? (
            <>
              <div className="pl-evidence-summary"><strong>Pipeline validasi data sensor</strong><span>Outcome: waktu pemrosesan turun 38% · Evidence tersedia</span></div>
              <label>Catatan revisi<textarea value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} placeholder="Jelaskan bagian yang perlu diperbaiki" /></label>
              <div className="pl-button-row"><button className="pl-button pl-button-primary" onClick={() => completeAction("contribution", "Kontribusi AquaLoop dikonfirmasi")} type="button">Konfirmasi kontribusi</button><button className="pl-button pl-button-secondary" onClick={() => revisionNote && completeAction("contribution", `Revisi diminta: ${revisionNote}`)} type="button">Minta revisi</button></div>
            </>
          ) : (
            <div className="pl-button-row"><button className="pl-button pl-button-primary" onClick={() => completeAction(selectedAction, `${pendingActions.find(([id]) => id === selectedAction)?.[1]} selesai`)} type="button">Selesaikan tindakan</button><button className="pl-button pl-button-secondary" onClick={() => setSelectedAction(null)} type="button">Tutup</button></div>
          )}
        </section>
      ) : null}

      <section className="pl-main-grid">
        <div>
          <SectionTitle title="Proyek aktif" action={<Anchor href="/my-projects" className="pl-text-action">Lihat semua</Anchor>} />
          <div className="pl-active-project">
            <div className="pl-active-project-top">
              <span className="pl-icon-box"><FolderOpen size={24} weight="duotone" /></span>
              <div><span className="pl-status success">PILOT</span><h3>AquaLoop Open Water Monitoring</h3></div>
              <span className="pl-team-stack"><i>RK</i><i>ND</i><i>+3</i></span>
            </div>
            <div className="pl-project-progress">
              <div><span>Validasi data lapangan</span><strong>72%</strong></div>
              <div className="pl-progress"><span style={{ width: "72%" }} /></div>
            </div>
            <div className="pl-project-footer">
              <span>Diperbarui 2 jam lalu</span>
              <Anchor href="/projects/aqua-loop/manage" className="pl-text-action">Buka workspace <ArrowRight size={16} /></Anchor>
            </div>
          </div>
        </div>
        <aside className="pl-collab-summary">
          <span className="pl-icon-box"><UsersThree size={25} weight="duotone" /></span>
          <h3>Kolaborasi Anda</h3>
          <strong>4</strong>
          <p>percakapan aktif di 3 proyek</p>
          <div><span>2 menunggu respons</span><span>1 undangan baru</span></div>
          <Anchor href="/collaboration" className="pl-text-action">Buka kolaborasi</Anchor>
        </aside>
      </section>

      {!recommendationHidden ? (
        <section className="pl-section">
          <SectionTitle eyebrow="Matching relevan" title="Kecocokan yang layak Anda pertimbangkan" />
          <div className="pl-match-grid">
            {[
              ["Urban Heat Data Pipeline", "Nexa Research Lab", "91%", "4 sinyal cocok"],
              ["Open Biodiversity Index", "Bumi Data Collective", "84%", "3 sinyal cocok"],
            ].map(([title, org, score, reason]) => (
              <article className="pl-match-card" key={title}>
                <div><span className="pl-match-percent">{score}</span><span>{reason}</span></div>
                <h3>{title}</h3><p>{org}</p>
                <div className="pl-tag-row"><span className="pl-tag">Data pipeline</span><span className="pl-tag">Climate</span></div>
                <div className="pl-card-actions"><Anchor href="/matches/aqua-maya" className="pl-text-action">Lihat alasan</Anchor><button onClick={() => {
                  const nextSaved = savedMatches.includes(title) ? savedMatches.filter((value) => value !== title) : [...savedMatches, title];
                  setSavedMatches(nextSaved);
                  sessionStorage.setItem("projectlink-saved-matches", JSON.stringify(nextSaved));
                }} type="button">{savedMatches.includes(title) ? "Tersimpan ✓" : "Simpan"}</button><button onClick={() => {
                  const nextCount = rejectionCount + 1;
                  setRejectionCount(nextCount);
                  sessionStorage.setItem("projectlink-rejection-count", String(nextCount));
                  onHideRecommendation?.();
                }} type="button">Tidak relevan</button></div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div className="pl-rejection-recovery"><p>Rekomendasi disembunyikan dan feedback diterapkan.</p>{rejectionCount >= 2 ? <p><strong>Kami mengurangi rekomendasi serupa.</strong> Anda dapat menyesuaikan preferensi atau menggunakan pencarian langsung.</p> : null}<button className="pl-restore-recommendation" onClick={onHideRecommendation} type="button">Urungkan</button></div>
      )}

      <section className="pl-lower-grid pl-section">
        <div>
          <SectionTitle title="Peluang untuk Anda" />
          <div className="pl-opportunity-list">
            {[
              ["Data Steward · Remote", "Ocean Commons", "6–8 jam/minggu"],
              ["Research Engineer", "Nexa Research Lab", "Bandung · Hybrid"],
              ["Mentor Open Hardware", "Ruang Inovasi", "4 minggu"],
            ].map(([title, org, meta]) => (
              <a href="/opportunities/urban-heat" key={title}>
                <span className="pl-icon-box small"><TrendUp size={19} /></span>
                <span><strong>{title}</strong><small>{org} · {meta}</small></span>
                <ArrowRight size={17} />
              </a>
            ))}
          </div>
        </div>
        <aside>
          <SectionTitle title="Aktivitas terbaru" />
          <div className="pl-timeline">
            {activities.map((activity, index) => <div key={`${activity}-${index}`}><i /><span><strong>{activity}</strong><small>Baru saja · tersimpan di sesi</small></span></div>)}
            <div><i /><span><strong>Evidence diverifikasi</strong><small>Pipeline AquaLoop · 2 jam lalu</small></span></div>
            <div><i /><span><strong>Raka menambahkan catatan</strong><small>Workspace proyek · Kemarin</small></span></div>
            <div><i /><span><strong>Profil muncul di pencarian</strong><small>4 kali dalam 7 hari</small></span></div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function OrganizationHome() {
  return (
    <div className="pl-home pl-dashboard">
      <section className="pl-org-context">
        <div className="pl-org-identity">
          <span className="pl-org-logo">NX</span>
          <div>
            <p className="pl-eyebrow">Workspace organisasi</p>
            <h1>Nexa Research Lab</h1>
            <p>Applied Research · Climate Technology · Bandung</p>
          </div>
        </div>
        <div className="pl-button-row">
          <Anchor href="/home">Beralih ke personal</Anchor>
          <Anchor href="/organization/nexa-research-lab/projects" className="pl-button pl-button-primary"><Plus size={18} /> Buat peluang</Anchor>
        </div>
      </section>

      <section className="pl-org-action-grid">
        {[
          ["3", "Aplikasi baru", "Perlu ditinjau minggu ini", "Navy", "/organization/nexa-research-lab/shortlists"],
          ["1", "Persetujuan", "Offer menunggu owner", "Blue", "/organization/nexa-research-lab/pipeline"],
          ["2", "Shortlist aktif", "Dibagikan ke 4 anggota", "Teal", "/organization/nexa-research-lab/shortlists"],
          ["1", "Role belum siap", "Batasi akses sebelum mulai", "Soft", "/organization/nexa-research-lab/members"],
        ].map(([value, label, text, tone, href]) => (
          <a className={`pl-org-action ${tone.toLowerCase()}`} href={href} key={label}>
            <span>{value}</span><div><strong>{label}</strong><small>{text}</small></div><ArrowRight size={18} />
          </a>
        ))}
      </section>

      <section className="pl-main-grid pl-org-main">
        <div>
          <SectionTitle title="Pipeline kolaborasi" action={<Anchor href="/organization/nexa-research-lab/pipeline" className="pl-text-action">Buka pipeline</Anchor>} />
          <div className="pl-pipeline-preview">
            {[
              ["Ditemukan", 8, "44%"],
              ["Ditinjau", 5, "30%"],
              ["Dihubungi", 3, "18%"],
              ["Diterima", 2, "12%"],
            ].map(([label, value, width]) => (
              <div key={label}><span>{label}</span><div><i style={{ width }} /></div><strong>{value}</strong></div>
            ))}
          </div>
        </div>
        <aside className="pl-shortlist-card">
          <div className="pl-person-row"><span className="pl-icon-box"><UsersThree size={24} /></span><div><h3>Urban Heat Pilot</h3><span>Shared shortlist</span></div></div>
          <div className="pl-shortlisted">
            <span className="pl-avatar">MP</span><div><strong>Maya Pradipta</strong><small>91% match · Reviewing</small></div>
          </div>
          <div className="pl-shortlisted">
            <span className="pl-avatar">RA</span><div><strong>Rafi Akbar</strong><small>86% match · Contacted</small></div>
          </div>
          <Anchor href="/organization/nexa-research-lab/shortlists" className="pl-text-action">Kelola shortlist</Anchor>
        </aside>
      </section>

      <section className="pl-section">
        <SectionTitle title="Proyek aktif" action={<Anchor href="/organization/nexa-research-lab/projects" className="pl-text-action">Lihat semua</Anchor>} />
        <div className="pl-match-grid">
          <ProjectPreview title="Urban Heat Mapping Research Pilot" organization="Nexa Research Lab" stage="RESEARCH" tags={["Geospatial", "Climate"]} tone="teal" />
          <ProjectPreview title="Open Sensor Calibration Library" organization="Nexa Research Lab" stage="BUILDING" tags={["Open source", "IoT"]} />
        </div>
      </section>

      <section className="pl-problem-search">
        <div>
          <span className="pl-icon-box"><MagnifyingGlass size={26} weight="duotone" /></span>
          <p className="pl-eyebrow">Cari berdasarkan masalah</p>
          <h2>Temukan evidence dan orang yang pernah menyelesaikan tantangan serupa.</h2>
          <p>Pencarian tidak berhenti pada jabatan atau kata kunci keahlian.</p>
        </div>
        <form action="/organization/nexa-research-lab/search">
          <input name="scope" type="hidden" value="talent" />
          <label>
            <span className="sr-only">Masalah yang ingin diselesaikan</span>
            <input name="q" placeholder="Contoh: validasi data sensor suhu perkotaan" />
          </label>
          <button className="pl-button pl-button-primary" type="submit">Cari solusi <ArrowRight size={18} /></button>
        </form>
      </section>

      <section className="pl-metric-grid">
        <div><Buildings size={22} weight="duotone" /><strong>4</strong><span>Proyek aktif</span></div>
        <div><UsersThree size={22} weight="duotone" /><strong>18</strong><span>Kolaborator</span></div>
        <div><Handshake size={22} weight="duotone" /><strong>7</strong><span>Kolaborasi dimulai</span></div>
        <div><MapPin size={22} weight="duotone" /><strong>3</strong><span>Lokasi pilot</span></div>
      </section>
    </div>
  );
}

export function DesignSystemPreview() {
  return (
    <div className="pl-home pl-design-system">
      <SectionTitle eyebrow="Milestone 1" title="ProjectLink Design System" description="Fondasi visual untuk seluruh layar: profesional, evidence-led, dan tidak terasa seperti marketplace generik." />
      <section>
        <h2>Warna</h2>
        <div className="pl-swatch-grid">
          {[
            ["Primary", "#075FF7"], ["Primary strong", "#004CD6"], ["Secondary", "#08C9A5"],
            ["Navy", "#06245A"], ["Canvas", "#F7FAFF"], ["Surface", "#FFFFFF"],
          ].map(([name, value]) => <div key={name}><i style={{ background: value }} /><strong>{name}</strong><span>{value}</span></div>)}
        </div>
      </section>
      <section>
        <h2>Komponen inti</h2>
        <div className="pl-component-row">
          <button className="pl-button pl-button-primary">Tindakan utama</button>
          <button className="pl-button pl-button-secondary">Tindakan sekunder</button>
          <button className="pl-button pl-button-ghost">Tindakan ringan</button>
          <span className="pl-status success">Terverifikasi</span>
          <span className="pl-status">PILOT</span>
        </div>
      </section>
      <section>
        <h2>Ikon dan informasi</h2>
        <div className="pl-goal-grid">
          <div className="pl-goal-card"><span className="pl-icon-box"><FolderOpen size={26} weight="duotone" /></span><h3>Proyek</h3><p>Objek kerja utama dan kebutuhan.</p></div>
          <div className="pl-goal-card"><span className="pl-icon-box"><UserCircle size={26} weight="duotone" /></span><h3>Orang</h3><p>Kontribusi dan evidence individual.</p></div>
          <div className="pl-goal-card"><span className="pl-icon-box"><Handshake size={26} weight="duotone" /></span><h3>Kolaborasi</h3><p>Konteks bersama dan tindak lanjut.</p></div>
          <div className="pl-goal-card"><span className="pl-icon-box"><Target size={26} weight="duotone" /></span><h3>Matching</h3><p>Alasan cocok, gap, dan keyakinan.</p></div>
        </div>
      </section>
    </div>
  );
}
