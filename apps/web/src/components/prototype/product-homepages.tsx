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
import { useEffect, useRef, useState } from "react";
import { announce } from "./accessibility";
import ProjectLinkFolder from "../ui/projectlink-folder/ProjectLinkFolder";
import CardSwap, { Card } from "../ui/card-swap/CardSwap";
import { featuredProjects, FeaturedProject, OpenNeed } from "../../data/guest-homepage-projects";
import { SubscriptionData, deriveAIUsageStatus } from "../../types/domain/subscription";

type FolderId = "project" | "contribution" | "evidence" | "matching" | "collaboration";

type PendingIntent =
  | {
      type: 'apply-opportunity';
      projectId: string;
      opportunityId: string;
      returnTo: string;
    }
  | {
      type: 'create-opportunity';
      returnTo: string;
    };


type HomeProps = {
  onFirstValue?: () => void;
  onHideRecommendation?: () => void;
  recommendationHidden?: boolean;
  subscription?: SubscriptionData;
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

// Prototype Authentication Hook
function usePrototypeAuth() {
  const [user, setUser] = useState<{ name: string; ownedProjects: Array<{ id: string; title: string }> } | null>(null);
  const [status, setStatus] = useState<'unauthenticated' | 'authenticated'>('unauthenticated');

  useEffect(() => {
    const savedUser = localStorage.getItem('projectlink_prototype_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setStatus('authenticated');
    }
  }, []);

  const login = () => {
    const mockUser = {
      name: "Taufik Hidayat",
      ownedProjects: [
        { id: "user-project-1", title: "Sistem Energi Mandiri Pedesaan" },
        { id: "user-project-2", title: "Monitoring Microgrid Pintar" }
      ]
    };
    setUser(mockUser);
    setStatus('authenticated');
    localStorage.setItem('projectlink_prototype_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setStatus('unauthenticated');
    localStorage.removeItem('projectlink_prototype_user');
  };

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    login,
    logout
  };
}

function ReturningSubscriptionSummary({ subscription }: { subscription: SubscriptionData }) {
  if (!subscription || subscription.plan === "none" || subscription.plan === "organization" || subscription.plan === "enterprise") return null;

  const isPro = subscription.plan === "pro";
  const planName = isPro ? "Pro Individual" : "Free Core";
  const aiStatus = deriveAIUsageStatus(subscription.ai.usage);
  const { used, limit, resetAt } = subscription.ai.usage;
  
  const isCanceledAtPeriodEnd = subscription.status === "canceled" && subscription.cancelAtPeriodEnd;
  const isFullyCanceled = subscription.status === "canceled" && !subscription.cancelAtPeriodEnd;
  const isPastDue = subscription.status === "past_due" || (subscription.paymentStatus === "failed" && subscription.plan !== "free");
  
  const formatDate = (isoStr?: string) => isoStr ? new Date(isoStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-";

  let ctaLabel = isPro ? "Kelola paket" : "Lihat paket";
  let ctaHref = isPro ? "/subscription" : "/subscription#plans";
  let statusBadge = null;
  let statusMessage = null;
  
  if (isPastDue) {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-red-100 tw:text-red-800">Past Due</span>;
    statusMessage = "Tagihan terakhir gagal diproses.";
    ctaLabel = "Lihat status tagihan";
    ctaHref = "/subscription#billing-status";
  } else if (isCanceledAtPeriodEnd) {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-slate-100 tw:text-slate-800">Dijadwalkan Berhenti</span>;
    statusMessage = `Aktif sampai ${formatDate(subscription.currentPeriodEnd || subscription.cancelDate)}.`;
    ctaLabel = "Lihat detail";
    ctaHref = "/subscription";
  } else if (isFullyCanceled) {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-slate-100 tw:text-slate-800">Dibatalkan</span>;
    statusMessage = "Langganan telah dibatalkan.";
    ctaLabel = "Lihat paket";
    ctaHref = "/subscription#plans";
  } else if (aiStatus === "limit_reached") {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-red-100 tw:text-red-800">Kuota Habis</span>;
    statusMessage = `AI dibatasi hingga ${formatDate(resetAt)}.`;
    ctaLabel = isPro ? "Lihat penggunaan" : "Lihat paket";
    ctaHref = isPro ? "/subscription#ai-usage" : "/subscription#plans";
  } else if (aiStatus === "near_limit") {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-amber-100 tw:text-amber-800">Hampir Habis</span>;
    statusMessage = `Tersisa ${limit ? limit - used : 0} penggunaan AI bulan ini.`;
    ctaLabel = isPro ? "Lihat penggunaan" : "Lihat paket";
    ctaHref = isPro ? "/subscription#ai-usage" : "/subscription#plans";
  } else if (isPro) {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-emerald-100 tw:text-emerald-800">Aktif</span>;
    statusMessage = `Aktif hingga ${formatDate(subscription.renewalDate)}.`;
  } else {
    statusBadge = <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-sm tw:font-medium tw:bg-slate-100 tw:text-slate-600">Free</span>;
    statusMessage = `Kuota AI direset pada ${formatDate(resetAt)}.`;
  }

  const isUnlimited = limit === null;
  const displayLimit = isUnlimited ? "∞" : limit;
  const ariaLimit = isUnlimited ? "Tak terbatas" : limit;
  const usagePercentage = (!isUnlimited && limit) ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="pl-returning-subscription-summary pl-ui-scope tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:p-4 tw:shadow-sm tw:w-full tw:max-w-[320px] tw:flex-shrink-0">
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-2">
        <h3 className="tw:text-base tw:font-bold tw:text-slate-900 tw:flex tw:items-center tw:gap-1.5">
          {isPro ? <Sparkle size={18} weight="duotone" className="tw:text-blue-600" /> : <RocketLaunch size={18} weight="duotone" className="tw:text-slate-500" />}
          {planName}
        </h3>
        {statusBadge}
      </div>
      
      {statusMessage && (
        <p className="tw:text-sm tw:text-slate-500 tw:mb-4">{statusMessage}</p>
      )}

      <div className="tw:mb-5">
        <div className="tw:flex tw:justify-between tw:text-sm tw:mb-2">
          <span className="tw:text-slate-600">Penggunaan AI</span>
          <span className="tw:font-medium tw:text-slate-900" aria-label={`Terpakai ${used} dari ${ariaLimit}`}>{used} / {displayLimit}</span>
        </div>
        {!isUnlimited && (
          <div 
            className="tw:h-2 tw:w-full tw:bg-slate-100 tw:rounded-full tw:overflow-hidden"
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-label="Penggunaan AI bulan ini"
          >
            <div 
              className={`tw:h-full tw:rounded-full tw:transition-all ${aiStatus === 'limit_reached' ? 'tw:bg-red-500' : aiStatus === 'near_limit' ? 'tw:bg-amber-500' : 'tw:bg-blue-600'}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        )}
      </div>

      <Anchor 
        href={ctaHref}
        className="tw:inline-flex tw:items-center tw:justify-center tw:w-full tw:min-h-[44px] tw:px-4 tw:py-2 tw:text-sm tw:font-semibold tw:text-slate-700 tw:bg-slate-50 hover:tw:bg-slate-100 tw:border tw:border-slate-200 tw:rounded-lg tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400 tw:whitespace-nowrap"
      >
        {ctaLabel}
      </Anchor>
    </div>
  );
}

export function GuestHome() {
  // Prototype Authentication state
  const auth = usePrototypeAuth();

  const [activeFolder, setActiveFolder] = useState<FolderId | null>(null);
  const [selectedMobileFolder, setSelectedMobileFolder] = useState<FolderId>("project");
  const [currentPaperIndex, setCurrentPaperIndex] = useState<number>(2);
  const [inspectorPaperIndex, setInspectorPaperIndex] = useState<number>(2);
  const [isFolderComplete, setIsFolderComplete] = useState<boolean>(false);
  const [isPaperExpanded, setIsPaperExpanded] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // React Bits homepage components states
  const [activeFeaturedProjectId, setActiveFeaturedProjectId] = useState(featuredProjects[0].id);
  const [selectedOpenNeedId, setSelectedOpenNeedId] = useState<string | null>(featuredProjects[0].openNeeds[0]?.id ?? null);
  const [selectedOwnedProjectId, setSelectedOwnedProjectId] = useState<string | null>(null);
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isOwnedProjectDialogOpen, setIsOwnedProjectDialogOpen] = useState(false);

  const inspectorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFolderTimers = () => {
    if (inspectorTimerRef.current) {
      clearTimeout(inspectorTimerRef.current);
      inspectorTimerRef.current = null;
    }
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearFolderTimers();
  }, []);

  const resetFolderState = (nextFolder: FolderId | null) => {
    clearFolderTimers();
    setActiveFolder(nextFolder);
    setCurrentPaperIndex(2);
    setInspectorPaperIndex(2);
    setIsFolderComplete(false);
    setIsPaperExpanded(false);
    setIsTransitioning(false);
  };

  const handleFolderToggle = (folderId: FolderId, open: boolean) => {
    if (open) {
      resetFolderState(folderId);
    } else {
      resetFolderState(null);
    }
  };

  const handleMobileFolderSelect = (folderId: FolderId) => {
    setSelectedMobileFolder(folderId);
    resetFolderState(null);
  };

  const handlePaperClick = (index: number) => {
    if (!isFolderComplete) {
      clearFolderTimers();
      setIsPaperExpanded(true);
      setCurrentPaperIndex(index);
      setInspectorPaperIndex(index);
      setIsTransitioning(false);
    }
  };

  const handleCloseExpanded = () => {
    setIsPaperExpanded(false);
    setCurrentPaperIndex(2);
    setInspectorPaperIndex(2);
  };

  const handleNextPaper = () => {
    if (currentPaperIndex > 0) {
      const nextIndex = currentPaperIndex - 1;
      setIsTransitioning(true);
      setCurrentPaperIndex(nextIndex);
      if (inspectorTimerRef.current) {
        clearTimeout(inspectorTimerRef.current);
      }
      inspectorTimerRef.current = setTimeout(() => {
        setInspectorPaperIndex(nextIndex);
        setIsTransitioning(false);
      }, 250);
    } else {
      setCurrentPaperIndex(-1);
      setIsFolderComplete(true);
      clearFolderTimers();
      autoCloseTimerRef.current = setTimeout(() => {
        resetFolderState(null);
      }, 1500);
    }
  };

  const folders = [
    {
      id: "project" as FolderId,
      label: "Project",
      ariaLabel: "Buka folder Project",
      color: "#315FEE",
      colorEnd: "#2450D8",
      colorBack: "#1F46C7",
      shadowColor: "rgba(36, 80, 216, 0.22)",
      items: [
        <strong key="p1">Problem Brief</strong>,
        <strong key="p2">Readiness</strong>,
        <strong key="p3">Open Need</strong>,
      ]
    },
    {
      id: "contribution" as FolderId,
      label: "Contribution",
      ariaLabel: "Buka folder Contribution",
      color: "#4DA6DF",
      colorEnd: "#318ED0",
      colorBack: "#287CB9",
      shadowColor: "rgba(49, 142, 208, 0.22)",
      items: [
        <strong key="c1">Role</strong>,
        <strong key="c2">Responsibility</strong>,
        <strong key="c3">Output</strong>,
      ]
    },
    {
      id: "evidence" as FolderId,
      label: "Evidence",
      ariaLabel: "Buka folder Evidence",
      color: "#58C7AA",
      colorEnd: "#36AE91",
      colorBack: "#2A957D",
      shadowColor: "rgba(54, 174, 145, 0.22)",
      items: [
        <strong key="e1">Repository</strong>,
        <strong key="e2">Test Report</strong>,
        <strong key="e3">Project Doc</strong>,
      ]
    },
    {
      id: "matching" as FolderId,
      label: "Matching",
      ariaLabel: "Buka folder Matching",
      color: "#5548E8",
      colorEnd: "#4136C7",
      colorBack: "#352BAF",
      shadowColor: "rgba(65, 54, 199, 0.22)",
      items: [
        <strong key="m1">Primary Reason</strong>,
        <strong key="m2">Evidence Signal</strong>,
        <strong key="m3">Gap & Confidence</strong>,
      ]
    },
    {
      id: "collaboration" as FolderId,
      label: "Collaboration",
      ariaLabel: "Buka folder Collaboration",
      color: "#4EB5EB",
      colorEnd: "#309BD7",
      colorBack: "#2786BD",
      shadowColor: "rgba(48, 155, 215, 0.22)",
      items: [
        <strong key="co1">Request</strong>,
        <strong key="co2">Next Step</strong>,
        <strong key="co3">Current Stage</strong>,
      ]
    }
  ];

  const paperContents: Record<FolderId, Array<{ title: string; desc: string }>> = {
    project: [
      { title: "Problem Brief", desc: "Menjelaskan masalah utama dan konteks yang sedang diselesaikan proyek." },
      { title: "Readiness", desc: "Menunjukkan kesiapan proyek untuk diuji, dikembangkan, atau dikolaborasikan." },
      { title: "Open Need", desc: "Menunjukkan peran atau kontribusi yang sedang dibutuhkan proyek." },
    ],
    contribution: [
      { title: "Role", desc: "Menjelaskan posisi dan fungsi seseorang di dalam proyek." },
      { title: "Responsibility", desc: "Menunjukkan tanggung jawab yang benar-benar dikerjakan." },
      { title: "Output", desc: "Menampilkan hasil kerja nyata dari kontribusi tersebut." },
    ],
    evidence: [
      { title: "Project Document", desc: "Memuat konteks, keputusan, dan perkembangan penting proyek." },
      { title: "Test Report", desc: "Menunjukkan hasil pengujian yang dapat digunakan untuk memvalidasi pekerjaan." },
      { title: "Repository", desc: "Menyediakan implementasi teknis yang dapat diperiksa secara langsung." },
    ],
    matching: [
      { title: "Primary Reason", desc: "Menjelaskan alasan utama sebuah rekomendasi ditampilkan." },
      { title: "Evidence Signal", desc: "Menunjukkan bukti yang mendukung kecocokan tersebut." },
      { title: "Gap & Confidence", desc: "Menampilkan celah dan tingkat keyakinan sistem secara terbuka." },
    ],
    collaboration: [
      { title: "Request", desc: "Menyampaikan kebutuhan kolaborasi dengan konteks yang jelas." },
      { title: "Next Step", desc: "Menunjukkan tindakan berikutnya bagi kedua pihak." },
      { title: "Current Stage", desc: "Memperlihatkan posisi proses kolaborasi saat ini." },
    ],
  };

  const completedLabels: Record<FolderId, string> = {
    project: "3/3 konteks ditinjau ✓",
    contribution: "3/3 detail ditinjau ✓",
    evidence: "3/3 bukti ditinjau ✓",
    matching: "3/3 sinyal ditinjau ✓",
    collaboration: "3/3 langkah ditinjau ✓",
  };

  const completedMessages: Record<FolderId, string> = {
    project: "3/3 konteks telah ditinjau ✓",
    contribution: "3/3 detail telah ditinjau ✓",
    evidence: "3/3 bukti telah ditinjau ✓",
    matching: "3/3 sinyal telah ditinjau ✓",
    collaboration: "3/3 langkah telah ditinjau ✓",
  };

  const getFolderLabel = (folder: typeof folders[0]) => {
    if (activeFolder === folder.id && isFolderComplete) {
      return completedLabels[folder.id];
    }
    return folder.label;
  };

  const activePaperInfo = activeFolder && currentPaperIndex >= 0 ? paperContents[activeFolder][inspectorPaperIndex] : null;
  const indexLabel = currentPaperIndex === 2 ? "1 / 3" : currentPaperIndex === 1 ? "2 / 3" : "3 / 3";

  // CardSwap project synchronization handler
  const handleActiveProjectChange = (originalIndex: number) => {
    const project = featuredProjects[originalIndex];
    if (project) {
      setActiveFeaturedProjectId(project.id);
      setSelectedOpenNeedId(project.openNeeds[0]?.id ?? null);
    }
  };

  const activeProject = featuredProjects.find(p => p.id === activeFeaturedProjectId) || featuredProjects[0];
  const activeOpenNeed = activeProject.openNeeds.find(n => n.id === selectedOpenNeedId) || activeProject.openNeeds[0];

  // Auth Intent handlers
  const handleApplyContribution = () => {
    if (!selectedOpenNeedId) return;

    if (!auth.isAuthenticated) {
      setPendingIntent({
        type: 'apply-opportunity',
        projectId: activeFeaturedProjectId,
        opportunityId: selectedOpenNeedId,
        returnTo: '/'
      });
      setIsAuthDialogOpen(true);
    } else {
      announce(`Mengarahkan ke form pengajuan kontribusi untuk oportunitas ${selectedOpenNeedId}...`);
      window.location.href = `/opportunities/${selectedOpenNeedId}/apply`;
    }
  };

  const handleCreateOpportunity = () => {
    if (!auth.isAuthenticated) {
      setPendingIntent({
        type: 'create-opportunity',
        returnTo: '/'
      });
      setIsAuthDialogOpen(true);
    } else {
      if (auth.user?.ownedProjects && auth.user.ownedProjects.length > 0) {
        setIsOwnedProjectDialogOpen(true);
      } else {
        window.location.href = '/projects/new';
      }
    }
  };

  const handleAuthSuccess = () => {
    auth.login();
    setIsAuthDialogOpen(false);

    if (pendingIntent) {
      if (pendingIntent.type === 'apply-opportunity') {
        announce(`Login sukses! Melanjutkan ke oportunitas ${pendingIntent.opportunityId}...`);
        window.location.href = `/opportunities/${pendingIntent.opportunityId}/apply`;
      } else if (pendingIntent.type === 'create-opportunity') {
        // simulation after login:
        // if user has owned projects, open selection dialog. Otherwise go to new project page
        const mockUser = {
          name: "Taufik Hidayat",
          ownedProjects: [
            { id: "user-project-1", title: "Sistem Energi Mandiri Pedesaan" },
            { id: "user-project-2", title: "Monitoring Microgrid Pintar" }
          ]
        };
        if (mockUser.ownedProjects && mockUser.ownedProjects.length > 0) {
          setIsOwnedProjectDialogOpen(true);
        } else {
          window.location.href = '/projects/new';
        }
      }
      setPendingIntent(null);
    }
  };

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
      <section className="pl-editorial-hero">
        <div className="pl-guest-container pl-editorial-hero-inner">
          <div className="pl-hero-content">
            <span className="pl-eyebrow">Project • Contribution • Evidence • Matching • Collaboration</span>
            <h1>Bangun identitas profesional dari pekerjaan nyata.</h1>
            <p>
              TautIn menghubungkan kebutuhan proyek, kontribusi terverifikasi, dan alasan kecocokan dalam satu ruang kolaborasi.
            </p>
            <div className="pl-button-row">
              <Anchor href="/explore" className="pl-button pl-button-primary">Jelajahi proyek</Anchor>
              <button 
                type="button" 
                onClick={handleCreateOpportunity} 
                className="pl-button pl-button-secondary"
              >
                Buka Peluang Kolaborasi
              </button>
            </div>
          </div>

          {/* Desktop floating folder stage */}
          <div className="pl-folder-stage pl-folder-stage--desktop">
            <div className={`pl-folder-stage__cluster ${isPaperExpanded ? "pl-folder-stage__cluster--dimmed" : ""}`}>
              {folders.map(folder => {
                const isActive = activeFolder === folder.id;
                return (
                  <div
                    key={folder.id}
                    className={`pl-floating-folder pl-floating-folder--${folder.id} ${
                      isActive ? "pl-floating-folder--active" : ""
                    }`}
                  >
                    <div className="pl-floating-folder__visual">
                      <ProjectLinkFolder
                        color={folder.color}
                        colorEnd={folder.colorEnd}
                        colorBack={folder.colorBack}
                        shadowColor={folder.shadowColor}
                        open={isActive}
                        onOpenChange={open => handleFolderToggle(folder.id, open)}
                        label={folder.ariaLabel}
                        items={folder.items}
                        currentPaperIndex={isActive ? currentPaperIndex : 2}
                        onPaperClick={handlePaperClick}
                      />
                      <span className="pl-floating-folder__label">
                        {getFolderLabel(folder)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Central Expanded Paper Layer */}
            {isPaperExpanded && activeFolder && (
              <>
                <div className="pl-expanded-paper-overlay" />
                <div className="pl-expanded-paper" aria-live="polite">
                  <div className="pl-expanded-paper__header">
                    <span className="pl-expanded-paper__badge">
                      {isFolderComplete ? "Selesai" : activeFolder.toUpperCase()}
                    </span>
                    {!isFolderComplete && (
                      <span className="pl-expanded-paper__index">{indexLabel}</span>
                    )}
                  </div>

                  <div className={`pl-expanded-paper__content ${isTransitioning ? "pl-expanded-paper__content--leaving" : "pl-expanded-paper__content--entering"}`}>
                    <div className="pl-expanded-paper__body">
                      {isFolderComplete ? (
                        <>
                          <h3>Tinjauan Selesai</h3>
                          <p>{completedMessages[activeFolder]}</p>
                        </>
                      ) : (
                        activePaperInfo && (
                          <>
                            <h3>{activePaperInfo.title}</h3>
                            <p>{activePaperInfo.desc}</p>
                          </>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pl-expanded-paper__actions">
                    <button
                      className="pl-button-sm pl-button-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseExpanded();
                      }}
                    >
                      Tutup
                    </button>

                    {isFolderComplete ? (
                      <button
                        className="pl-button-sm pl-button-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetFolderState(null);
                        }}
                      >
                        Selesai
                      </button>
                    ) : (
                      <button
                        className="pl-button-sm pl-button-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextPaper();
                        }}
                      >
                        {currentPaperIndex === 0 ? "Selesai" : "Lanjut →"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile folder stage with horizontal scroll selector */}
          <div className="pl-folder-stage pl-folder-stage--mobile">
            <div className="pl-mobile-folder-view">
              {folders.filter(f => f.id === selectedMobileFolder).map(folder => {
                const isActive = activeFolder === folder.id;
                return (
                  <div
                    key={folder.id}
                    className={`pl-floating-folder pl-floating-folder--mobile-active ${
                      isActive ? "pl-floating-folder--active" : ""
                    }`}
                  >
                    <div className="pl-floating-folder__visual">
                      <ProjectLinkFolder
                        color={folder.color}
                        colorEnd={folder.colorEnd}
                        colorBack={folder.colorBack}
                        shadowColor={folder.shadowColor}
                        open={isActive}
                        onOpenChange={open => handleFolderToggle(folder.id, open)}
                        label={folder.ariaLabel}
                        items={folder.items}
                        currentPaperIndex={isActive ? currentPaperIndex : 2}
                        onPaperClick={handlePaperClick}
                      />
                      <span className="pl-floating-folder__label">
                        {getFolderLabel(folder)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Expanded Paper */}
            {isPaperExpanded && activeFolder && (
              <div className="pl-expanded-paper" aria-live="polite">
                <div className="pl-expanded-paper__header">
                  <span className="pl-expanded-paper__badge">
                    {isFolderComplete ? "Selesai" : activeFolder.toUpperCase()}
                  </span>
                  {!isFolderComplete && (
                    <span className="pl-expanded-paper__index">{indexLabel}</span>
                  )}
                </div>

                <div className={`pl-expanded-paper__content ${isTransitioning ? "pl-expanded-paper__content--leaving" : "pl-expanded-paper__content--entering"}`}>
                  <div className="pl-expanded-paper__body">
                    {isFolderComplete ? (
                      <>
                        <h3>Tinjauan Selesai</h3>
                        <p>{completedMessages[activeFolder]}</p>
                      </>
                    ) : (
                      activePaperInfo && (
                        <>
                          <h3>{activePaperInfo.title}</h3>
                          <p>{activePaperInfo.desc}</p>
                        </>
                      )
                    )}
                  </div>
                </div>

                <div className="pl-expanded-paper__actions">
                  <button
                    className="pl-button-sm pl-button-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseExpanded();
                    }}
                  >
                    Tutup
                  </button>

                  {isFolderComplete ? (
                    <button
                      className="pl-button-sm pl-button-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetFolderState(null);
                      }}
                    >
                      Selesai
                    </button>
                  ) : (
                    <button
                      className="pl-button-sm pl-button-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPaper();
                      }}
                    >
                      {currentPaperIndex === 0 ? "Selesai" : "Lanjut →"}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="pl-mobile-folder-selector" role="tablist" aria-label="Pilih Folder">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  role="tab"
                  aria-selected={selectedMobileFolder === folder.id}
                  className={`pl-mobile-folder-btn ${selectedMobileFolder === folder.id ? "active" : ""}`}
                  onClick={() => handleMobileFolderSelect(folder.id)}
                >
                  {folder.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Goal selector custom section */}
      <section className="pl-section pl-goal-selector-section">
        <div className="pl-guest-container">
          <SectionTitle
            eyebrow="Tentukan Arah Anda"
            title="Apa yang ingin Anda lakukan di TautIn?"
            description="Pilih salah satu opsi untuk menyesuaikan alur eksplorasi Anda."
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
      </div>
    </section>

      {/* Proyek Pilihan with CardSwap split integration */}
      <section className="pl-section pl-featured-projects-section">
        <div className="pl-guest-container">
          <SectionTitle
            eyebrow="Proyek pilihan"
            title="Lihat peluang yang sedang bergerak"
            action={<Anchor href="/explore" className="pl-text-action">Lihat semua <ArrowRight size={17} /></Anchor>}
          />
          
          <div className="pl-project-split-layout">
            {/* Left panel: Active Project Details */}
            <div className="pl-project-split-left" aria-live="polite">
              <div className="pl-project-detail-card">
                <div className="pl-project-detail-header">
                  <span className="pl-project-detail-org">{activeProject.organization}</span>
                  <span className={`pl-status pl-status--${activeProject.lifecycle.toLowerCase()}`}>
                    {activeProject.lifecycle}
                  </span>
                </div>
                <h3 className="pl-project-detail-title">{activeProject.title}</h3>
                
                <div className="pl-project-detail-field">
                  <strong>Masalah yang diselesaikan:</strong>
                  <p>{activeProject.problem}</p>
                </div>

                <div className="pl-project-detail-field">
                  <strong>Readiness:</strong>
                  <p>{activeProject.readiness} <small className="pl-readiness-source">({activeProject.readinessSource})</small></p>
                </div>

                {activeProject.openNeeds && activeProject.openNeeds.length > 0 && (
                  <div className="pl-project-detail-field">
                    <strong>Kebutuhan Kontribusi:</strong>
                    <div className="pl-open-needs-selector">
                      {activeProject.openNeeds.map(need => (
                        <button
                          key={need.id}
                          type="button"
                          className={`pl-open-need-btn ${selectedOpenNeedId === need.id ? 'active' : ''}`}
                          onClick={() => setSelectedOpenNeedId(need.id)}
                        >
                          {need.title} · <small>{need.commitment}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pl-project-detail-actions">
                  <a 
                    href={selectedOpenNeedId ? `/opportunities/${selectedOpenNeedId}` : '#'} 
                    className={`pl-button pl-button-secondary ${!selectedOpenNeedId ? 'disabled' : ''}`}
                    aria-disabled={!selectedOpenNeedId}
                    onClick={(e) => {
                      if (!selectedOpenNeedId) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Lihat Kebutuhan
                  </a>
                  <button
                    type="button"
                    className="pl-button pl-button-primary"
                    disabled={!selectedOpenNeedId}
                    aria-disabled={!selectedOpenNeedId}
                    onClick={handleApplyContribution}
                  >
                    Ajukan Kontribusi
                  </button>
                </div>
              </div>
            </div>

            {/* Right panel: React Bits CardSwap Stack */}
            <div className="pl-featured-card-swap-wrap">
              <CardSwap
                width="100%"
                height={330}
                cardDistance={16}
                verticalDistance={26}
                delay={2000}
                interactionPauseDuration={10000}
                pauseOnHover
                skewAmount={2}
                easing="linear"
                onActiveCardChange={handleActiveProjectChange}
              >
                {featuredProjects.map((project, idx) => (
                  <Card key={project.id} className="project-card-swap__item">
                    <div className="project-card-swap__item-content">
                      <div className="project-card-swap__item-hdr">
                        <span className="project-card-swap__org">{project.organization}</span>
                        <span className="project-card-swap__lifecycle">{project.lifecycle}</span>
                      </div>
                      <h4 className="project-card-swap__title">{project.title}</h4>
                      <p className="project-card-swap__need">Kebutuhan utama: <strong>{project.openNeeds[0]?.title}</strong></p>
                      <p className="project-card-swap__reason">{project.recommendationReason}</p>
                      <div className="project-card-swap__footer">
                        <span>💡 {project.evidence.length} evidence</span>
                        <span>{project.matching.dataConfidence}% match</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Belt */}
      <section className="pl-cta-belt">
        <div className="pl-guest-container">
          <div className="pl-cta-belt-inner">
            <div className="pl-cta-belt-text">
              <h3>Mulai dengan konteks yang tepat</h3>
              <p>Kolaborasi yang baik dimulai dari bukti yang jelas.</p>
            </div>
            <div className="pl-cta-belt-actions">
              <Anchor href="/explore" className="pl-button pl-button-light">Jelajahi proyek</Anchor>
              <button 
                type="button" 
                onClick={handleCreateOpportunity} 
                className="pl-button pl-button-on-dark"
              >
                Buka Peluang Kolaborasi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Explainable AI Showcase Section (Reactive to rotating activeProject card) */}
      <section id="explainable-ai" className="pl-section pl-contribution-evidence-section">
        <div className="pl-guest-container pl-contribution-grid">
          <div className="pl-feature-copy" aria-live="polite">
            <span className="pl-icon-box"><Sparkle size={26} weight="duotone" /></span>
            <p className="pl-eyebrow">AI YANG DAPAT DIJELASKAN</p>
            <h2>Lihat bagaimana AI membantu Anda memahami proyek, kontribusi, dan peluang kolaborasi.</h2>
            <p>
              Dari explainable matching hingga ringkasan evidence, fitur AI membantu Anda menilai konteks tanpa kehilangan transparansi.
            </p>
            <div className="pl-button-row tw:mt-4">
              <Anchor href="/subscription" className="pl-button pl-button-primary">
                Lihat paket AI <ArrowRight size={17} />
              </Anchor>
              <Anchor href="#explainable-ai" className="pl-button pl-button-secondary">
                Lihat cara kerjanya
              </Anchor>
            </div>
          </div>
          
          <div className="pl-contribution-preview-wrap">
            <div className="pl-evidence-card" aria-live="polite">
              {/* Dynamic rotation rendering based on activeFeaturedProjectId */}
              {activeFeaturedProjectId === 'proj-river-watch' ? (
                <>
                  <div className="pl-person-row tw:border-b tw:border-slate-100 tw:pb-3 tw:mb-3">
                    <span className="pl-avatar large tw:bg-indigo-50 tw:text-indigo-600">🤖</span>
                    <div>
                      <strong className="tw:text-slate-900 tw:text-base">Explainable Matching AI</strong>
                      <span className="tw:text-xs tw:text-slate-500">Kecocokan dengan AquaLoop</span>
                    </div>
                    <span className="pl-status success tw:bg-indigo-50 tw:text-indigo-700 tw:border-indigo-200">
                      Match Score: 68%
                    </span>
                  </div>

                  <div className="tw:space-y-3">
                    <div>
                      <div className="tw:flex tw:justify-between tw:text-xs tw:font-semibold tw:text-slate-700 tw:mb-1">
                        <span>Match Score</span>
                        <span>68% (Medium Confidence)</span>
                      </div>
                      <div className="tw:w-full tw:bg-slate-100 tw:rounded-full tw:h-2">
                        <div className="tw:bg-indigo-600 tw:h-2 tw:rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div className="tw:bg-slate-50 tw:p-3 tw:rounded-lg tw:border tw:border-slate-100 tw:text-xs tw:space-y-1.5">
                      <div className="tw:font-semibold tw:text-slate-800 tw:mb-1">Alasan utama kecocokan:</div>
                      <div className="tw:text-emerald-700 tw:flex tw:items-center tw:gap-1.5">
                        <CheckCircle size={14} weight="fill" className="tw:flex-shrink-0" />
                        <span>Embedded systems &amp; firmware sesuai</span>
                      </div>
                      <div className="tw:text-emerald-700 tw:flex tw:items-center tw:gap-1.5">
                        <CheckCircle size={14} weight="fill" className="tw:flex-shrink-0" />
                        <span>Evidence firmware relevan terverifikasi</span>
                      </div>
                      <div className="tw:text-amber-700 tw:flex tw:items-center tw:gap-1.5">
                        <span className="tw:font-bold tw:w-3.5 tw:text-center">!</span>
                        <span>Deployment lapangan masih menjadi gap</span>
                      </div>
                    </div>
                  </div>

                  <div className="tw:mt-4 tw:pt-3 tw:border-t tw:border-slate-100 tw:flex tw:items-center tw:justify-between">
                    <span className="tw:text-[11px] tw:text-slate-400">Model v2.4 · Explainable AI</span>
                    <Anchor href="/matches/aqua-maya" className="tw:text-xs tw:font-semibold tw:text-indigo-600 hover:tw:text-indigo-800 tw:flex tw:items-center tw:gap-1">
                      Lihat alasan lengkap →
                    </Anchor>
                  </div>
                </>
              ) : activeFeaturedProjectId === 'proj-aqua-loop' ? (
                <>
                  <div className="pl-person-row tw:border-b tw:border-slate-100 tw:pb-3 tw:mb-3">
                    <span className="pl-avatar large tw:bg-emerald-50 tw:text-emerald-600">📄</span>
                    <div>
                      <strong className="tw:text-slate-900 tw:text-base">Evidence Summary AI</strong>
                      <span className="tw:text-xs tw:text-slate-500">Transparansi Artifact Bukti</span>
                    </div>
                    <span className="pl-status success tw:bg-emerald-50 tw:text-emerald-700 tw:border-emerald-200">
                      4 Evidence Ditemukan
                    </span>
                  </div>

                  <div className="tw:space-y-2 tw:text-xs">
                    <div className="tw:flex tw:items-center tw:justify-between tw:p-2 tw:bg-slate-50 tw:rounded-md tw:border tw:border-slate-100">
                      <span className="tw:font-medium tw:text-slate-800 tw:flex tw:items-center tw:gap-1.5">
                        <LinkSimple size={14} className="tw:text-slate-400" /> Repository firmware
                      </span>
                      <span className="tw:px-2 tw:py-0.5 tw:bg-emerald-100 tw:text-emerald-800 tw:font-semibold tw:rounded tw:text-[10px]">Verified</span>
                    </div>
                    <div className="tw:flex tw:items-center tw:justify-between tw:p-2 tw:bg-slate-50 tw:rounded-md tw:border tw:border-slate-100">
                      <span className="tw:font-medium tw:text-slate-800 tw:flex tw:items-center tw:gap-1.5">
                        <ClipboardText size={14} className="tw:text-slate-400" /> Dataset lapangan
                      </span>
                      <span className="tw:px-2 tw:py-0.5 tw:bg-emerald-100 tw:text-emerald-800 tw:font-semibold tw:rounded tw:text-[10px]">Verified</span>
                    </div>
                    <div className="tw:flex tw:items-center tw:justify-between tw:p-2 tw:bg-slate-50 tw:rounded-md tw:border tw:border-slate-100">
                      <span className="tw:font-medium tw:text-slate-800 tw:flex tw:items-center tw:gap-1.5">
                        <ClipboardText size={14} className="tw:text-slate-400" /> Laporan pengujian
                      </span>
                      <span className="tw:px-2 tw:py-0.5 tw:bg-amber-100 tw:text-amber-800 tw:font-semibold tw:rounded tw:text-[10px]">Pending</span>
                    </div>
                    <div className="tw:flex tw:items-center tw:justify-between tw:p-2 tw:bg-slate-50 tw:rounded-md tw:border tw:border-slate-100">
                      <span className="tw:font-medium tw:text-slate-800 tw:flex tw:items-center tw:gap-1.5">
                        <ClipboardText size={14} className="tw:text-slate-400" /> Spesifikasi teknis
                      </span>
                      <span className="tw:px-2 tw:py-0.5 tw:bg-slate-200 tw:text-slate-700 tw:font-semibold tw:rounded tw:text-[10px]">Restricted</span>
                    </div>
                  </div>

                  <div className="tw:mt-3 tw:pt-2 tw:border-t tw:border-slate-100 tw:flex tw:items-center tw:justify-between tw:text-xs">
                    <span className="tw:text-slate-500 tw:font-medium">2 verified · 1 pending · 1 restricted</span>
                    <Anchor href="/projects/aqua-loop/contributions" className="tw:font-semibold tw:text-emerald-600 hover:tw:text-emerald-800 tw:flex tw:items-center tw:gap-1">
                      Lihat evidence →
                    </Anchor>
                  </div>
                </>
              ) : activeFeaturedProjectId === 'proj-urban-heat' ? (
                <>
                  <div className="pl-person-row tw:border-b tw:border-slate-100 tw:pb-3 tw:mb-3">
                    <span className="pl-avatar large tw:bg-sky-50 tw:text-sky-600">📊</span>
                    <div>
                      <strong className="tw:text-slate-900 tw:text-base">Project Readiness AI</strong>
                      <span className="tw:text-xs tw:text-slate-500">Evaluasi Maturitas Proyek</span>
                    </div>
                    <div className="tw:flex tw:gap-1">
                      <span className="pl-status info tw:bg-sky-100 tw:text-sky-800 tw:font-bold">PROTOTYPE</span>
                    </div>
                  </div>

                  <div className="tw:text-xs tw:text-slate-500 tw:mb-3">
                    Sumber penilaian: <strong className="tw:text-slate-700">Self-reported &amp; AI Verified</strong>
                  </div>

                  <div className="tw:grid tw:grid-cols-2 tw:gap-2 tw:text-xs">
                    <div className="tw:bg-emerald-50/60 tw:p-2.5 tw:rounded-lg tw:border tw:border-emerald-100 tw:space-y-1">
                      <div className="tw:font-semibold tw:text-emerald-900 tw:mb-1.5">✓ Sudah tersedia</div>
                      <div className="tw:text-emerald-800">• Prototype sensor</div>
                      <div className="tw:text-emerald-800">• Dataset awal</div>
                      <div className="tw:text-emerald-800">• Tim aktif</div>
                    </div>
                    <div className="tw:bg-amber-50/60 tw:p-2.5 tw:rounded-lg tw:border tw:border-amber-100 tw:space-y-1">
                      <div className="tw:font-semibold tw:text-amber-900 tw:mb-1.5">! Masih dibutuhkan</div>
                      <div className="tw:text-amber-800">• Deployment plan</div>
                      <div className="tw:text-amber-800">• Mitra pengujian</div>
                    </div>
                  </div>

                  <div className="tw:mt-4 tw:pt-3 tw:border-t tw:border-slate-100 tw:flex tw:items-center tw:justify-between">
                    <span className="tw:text-[11px] tw:text-slate-400">Score readiness 74%</span>
                    <Anchor href="/projects/aqua-loop" className="tw:text-xs tw:font-semibold tw:text-sky-600 hover:tw:text-sky-800 tw:flex tw:items-center tw:gap-1">
                      Lihat kesiapan proyek →
                    </Anchor>
                  </div>
                </>
              ) : (
                <>
                  <div className="pl-person-row tw:border-b tw:border-slate-100 tw:pb-3 tw:mb-3">
                    <span className="pl-avatar large tw:bg-purple-50 tw:text-purple-600">💡</span>
                    <div>
                      <strong className="tw:text-slate-900 tw:text-base">Collaboration Insight AI</strong>
                      <span className="tw:text-xs tw:text-slate-500">Rekomendasi Tindakan Selanjutnya</span>
                    </div>
                    <span className="pl-status success tw:bg-purple-50 tw:text-purple-700 tw:border-purple-200">
                      Actionable
                    </span>
                  </div>

                  <div className="tw:bg-slate-50 tw:p-3 tw:rounded-lg tw:border tw:border-slate-200/80 tw:mb-3">
                    <div className="tw:flex tw:items-center tw:gap-1.5 tw:font-semibold tw:text-slate-900 tw:text-xs tw:mb-1">
                      <Handshake size={16} className="tw:text-purple-600" />
                      <span>Rekomendasi Diskusi Firmware</span>
                    </div>
                    <p className="tw:text-xs tw:text-slate-600 tw:m-0">
                      Diskusikan spesifikasi firmware sebelum sprint minggu depan.
                    </p>
                  </div>

                  <div className="tw:text-xs tw:text-slate-600 tw:mb-3 tw:space-y-1 tw:bg-purple-50/50 tw:p-2.5 tw:rounded-md">
                    <div className="tw:font-semibold tw:text-purple-900">Mengapa direkomendasikan?</div>
                    <p className="tw:m-0 tw:text-[11px] tw:text-purple-800">
                      Evidence firmware sudah tersedia dan tiga anggota aktif, tetapi parameter deployment belum disepakati.
                    </p>
                  </div>

                  <div className="tw:flex tw:flex-wrap tw:gap-1.5 tw:mb-3">
                    <span className="tw:px-2 tw:py-0.5 tw:bg-slate-100 tw:text-slate-700 tw:text-[10px] tw:font-medium tw:rounded-full">Ready for Sprint</span>
                    <span className="tw:px-2 tw:py-0.5 tw:bg-slate-100 tw:text-slate-700 tw:text-[10px] tw:font-medium tw:rounded-full">3 Members Active</span>
                    <span className="tw:px-2 tw:py-0.5 tw:bg-slate-100 tw:text-slate-700 tw:text-[10px] tw:font-medium tw:rounded-full">Medium Confidence</span>
                  </div>

                  <div className="tw:pt-2 tw:border-t tw:border-slate-100 tw:flex tw:items-center tw:justify-between">
                    <span className="tw:text-[11px] tw:text-slate-400">Aksi direkomendasikan</span>
                    <Anchor href="/collaboration" className="tw:text-xs tw:font-semibold tw:text-purple-600 hover:tw:text-purple-800 tw:flex tw:items-center tw:gap-1">
                      Mulai diskusi →
                    </Anchor>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Explainable Matching section (Reactive to selected project) */}
      <section className="pl-section pl-explainable-matching-section">
        <div className="pl-guest-container pl-matching-grid">
          <div className="pl-match-copy" aria-live="polite">
            <p className="pl-eyebrow">Matching yang transparan</p>
            <h2>Anda selalu dapat melihat mengapa sebuah rekomendasi muncul.</h2>
            <ul className="pl-check-list">
              <li><CheckCircle size={19} weight="fill" /> {activeProject.matching.primaryReason}</li>
              {activeProject.matching.supportingEvidence.map((evText, i) => (
                <li key={i}><CheckCircle size={19} weight="fill" /> Bukti: {evText}</li>
              ))}
              <li className="pl-check-list__gap"><CheckCircle size={19} weight="fill" /> Celah: {activeProject.matching.mainGap}</li>
            </ul>
            <p className="pl-matching-limitation">
              <strong>Keterbatasan data:</strong> {activeProject.matching.dataLimitation}
            </p>
          </div>

          <div className="pl-matching-visual-card" aria-live="polite">
            <div className="pl-match-score-header">
              <div className="pl-match-score">
                <span>{activeProject.matching.skillFit}%</span>
                <strong>Kecocokan</strong>
                <small>{activeProject.matching.confidenceLabel}</small>
              </div>
            </div>

            {/* Dynamic matching bar chart */}
            <div className="pl-matching-chart">
              {[
                { label: "Keahlian relevan", value: activeProject.matching.skillFit },
                { label: "Evidence coverage", value: activeProject.matching.evidenceCoverage },
                { label: "Ketersediaan", value: activeProject.matching.availability },
                { label: "Project readiness", value: activeProject.matching.projectReadiness },
                { label: "Data confidence", value: activeProject.matching.dataConfidence }
              ].map((bar) => (
                <div key={bar.label} className="pl-matching-chart__row">
                  <span className="pl-matching-chart__label">{bar.label}</span>
                  <div className="pl-matching-chart__bar-wrapper">
                    <div
                      className="pl-matching-chart__bar"
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                  <span className="pl-matching-chart__value">{bar.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Auth Dialog Modal */}
      {isAuthDialogOpen && (
        <div className="pl-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <div className="pl-modal-card">
            <h3 id="auth-modal-title">Autentikasi Diperlukan</h3>
            <p>Silakan masuk atau buat akun baru terlebih dahulu untuk melanjutkan tindakan terproteksi ini.</p>
            <div className="pl-modal-actions">
              <button
                type="button"
                className="pl-button pl-button-secondary"
                onClick={() => setIsAuthDialogOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="pl-button pl-button-primary"
                onClick={handleAuthSuccess}
              >
                Masuk (Simulasi)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owned Project Dialog Modal */}
      {isOwnedProjectDialogOpen && (
        <div className="pl-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="owned-projects-title">
          <div className="pl-modal-card">
            <h3 id="owned-projects-title">Pilih Proyek Anda</h3>
            <p>Pilih salah satu proyek milik Anda untuk menambahkan kebutuhan kontribusi baru:</p>
            
            <div className="pl-owned-projects-list">
              {(auth.user?.ownedProjects ?? [
                { id: "user-project-1", title: "Sistem Energi Mandiri Pedesaan" },
                { id: "user-project-2", title: "Monitoring Microgrid Pintar" }
              ]).map(proj => (
                <button
                  key={proj.id}
                  type="button"
                  className={`pl-owned-project-item-btn ${selectedOwnedProjectId === proj.id ? 'active' : ''}`}
                  onClick={() => setSelectedOwnedProjectId(proj.id)}
                >
                  {proj.title}
                </button>
              ))}
            </div>

            <div className="pl-modal-actions pl-modal-actions--spaced">
              <button
                type="button"
                className="pl-button pl-button-secondary"
                onClick={() => {
                  setIsOwnedProjectDialogOpen(false);
                  setSelectedOwnedProjectId(null);
                }}
              >
                Batal
              </button>
              <div className="pl-modal-actions-right">
                <Anchor href="/projects/new" className="pl-button pl-button-secondary">
                  Buat Proyek Baru
                </Anchor>
                <button
                  type="button"
                  className="pl-button pl-button-primary"
                  disabled={!selectedOwnedProjectId}
                  onClick={() => {
                    announce(`Mengarahkan ke pembuatan peluang untuk proyek ${selectedOwnedProjectId}...`);
                    window.location.href = `/opportunities/new?project=${selectedOwnedProjectId}`;
                  }}
                >
                  Lanjut ke Form Peluang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
        <section className="pl-inline-create">
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
              announce("Draft tersimpan. Preview publikasi tersedia.");
            }} type="button">
              Simpan draft dan preview <ArrowRight size={18} />
            </button>
            <button className="pl-button pl-button-ghost" onClick={() => setWorkspaceOpen(false)} type="button">Nanti saja</button>
          </div>
        </section>
      ) : null}

      {previewOpen ? (
        <section className="pl-inline-create pl-publish-preview">
          <div><p className="pl-eyebrow">Preview sebelum publikasi</p><h2>{goalDrafts[activeGoal]?.title || "Judul belum diisi"}</h2><p>{goalDrafts[activeGoal]?.problem || "Masalah belum dijelaskan."}</p></div>
          <div className="pl-preview-checks"><span><CheckCircle size={18} weight="fill" /> Draft tersimpan untuk tujuan ini</span><span><CheckCircle size={18} weight="fill" /> AI suggestion tetap dapat diedit</span><span><CheckCircle size={18} weight="fill" /> Belum dipublikasikan</span></div>
          <div className="pl-button-row">
            <button className="pl-button pl-button-primary" onClick={() => {
              sessionStorage.setItem("projectlink-first-value", "true");
              announce("Nilai pertama berhasil dipublikasikan.");
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
  subscription,
  persona = "personal",
}: HomeProps & { persona?: string }) {
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [savedMatches, setSavedMatches] = useState<string[]>([]);
  const actionDetailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedAction) actionDetailRef.current?.focus();
  }, [selectedAction]);

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
    announce(activity);
  };

  const pendingActions = [
    ["contribution", "Konfirmasi kontribusi", "AquaLoop meminta persetujuan output pipeline.", "Konfirmasi"],
    ["invitation", "Balas undangan", "Nexa Research Lab mengundang Anda ke pilot baru.", "Undangan"],
    ["evidence", "Lengkapi evidence", "Satu output belum memiliki tautan bukti.", "Evidence"],
  ].filter(([id]) => !completedActions.includes(id));

  return (
    <div className="pl-home pl-dashboard">
      <section className="pl-welcome pl-welcome-returning">
        <div className="pl-welcome-header">
          <p className="pl-eyebrow">Minggu ini di TautIn</p>
          <h1>Selamat datang kembali, {persona === "organization" ? "Nusantara Labs" : "Maya"}.</h1>
          <p>{persona === "organization" ? "Akses fitur administratif melalui sidebar untuk pengelolaan aset." : pendingActions.length ? `Ada ${pendingActions.length} hal yang layak Anda tinjau sebelum melanjutkan pekerjaan.` : "Semua tindakan utama sudah selesai."}</p>
          <div className="tw:mt-6">
            <Anchor href="/notifications" className="pl-button pl-button-primary">Tinjau semua tindakan</Anchor>
          </div>
        </div>
        {subscription && (
          <ReturningSubscriptionSummary subscription={subscription} />
        )}
      </section>

      {pendingActions.length ? <section className="pl-action-grid">
        {pendingActions.map(([id, title, text, label], index) => (
          <article className="pl-action-card" key={id}>
            <span className={`pl-priority ${index === 0 ? "high" : ""}`}>{label}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <button id={`action-trigger-${id}`} aria-expanded={selectedAction === id} aria-controls="action-detail" onClick={() => setSelectedAction(id)} type="button">Tinjau <ArrowRight size={16} /></button>
          </article>
        ))}
      </section> : (
        <section className="pl-all-complete"><CheckCircle size={38} weight="duotone" /><div><p className="pl-eyebrow">Semua selesai</p><h2>Tidak ada tugas yang menunggu.</h2><p>Lanjutkan proyek aktif atau buka discovery ringan tanpa urgency buatan.</p></div><div className="pl-button-row"><Anchor href="/projects/aqua-loop/manage" className="pl-button pl-button-primary">Kembali ke proyek</Anchor><Anchor href="/collaboration">Buka kolaborasi</Anchor></div></section>
      )}

      {selectedAction ? (
        <section
          className="pl-action-expanded"
          id="action-detail"
          ref={actionDetailRef}
          tabIndex={-1}
          aria-labelledby="action-detail-title"
          onKeyDown={(event) => {
            if (event.key === "Escape" && selectedAction) {
              const trigger = document.getElementById(`action-trigger-${selectedAction}`);
              setSelectedAction(null);
              window.setTimeout(() => trigger?.focus(), 0);
            }
          }}
        >
          <div><p className="pl-eyebrow">Action required</p><h2 id="action-detail-title">{pendingActions.find(([id]) => id === selectedAction)?.[1]}</h2><p>{pendingActions.find(([id]) => id === selectedAction)?.[2]}</p></div>
          {selectedAction === "contribution" ? (
            <>
              <div className="pl-evidence-summary"><strong>Pipeline validasi data sensor</strong><span>Outcome: waktu pemrosesan turun 38% · Evidence tersedia</span></div>
              <label>Catatan revisi<textarea value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} placeholder="Jelaskan bagian yang perlu diperbaiki" /></label>
              <div className="pl-button-row"><button className="pl-button pl-button-primary" onClick={() => completeAction("contribution", "Kontribusi AquaLoop dikonfirmasi")} type="button">Konfirmasi kontribusi</button><button className="pl-button pl-button-secondary" onClick={() => revisionNote && completeAction("contribution", `Revisi diminta: ${revisionNote}`)} type="button">Minta revisi</button></div>
            </>
          ) : (
            <div className="pl-button-row"><button className="pl-button pl-button-primary" onClick={() => completeAction(selectedAction, `${pendingActions.find(([id]) => id === selectedAction)?.[1]} selesai`)} type="button">Selesaikan tindakan</button><button className="pl-button pl-button-secondary" onClick={() => { const trigger = document.getElementById(`action-trigger-${selectedAction}`); setSelectedAction(null); window.setTimeout(() => trigger?.focus(), 0); }} type="button">Tutup</button></div>
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
                  announce(savedMatches.includes(title) ? `${title} dihapus dari matching tersimpan.` : `${title} disimpan.`);
                }} type="button">{savedMatches.includes(title) ? "Tersimpan ✓" : "Simpan"}</button><button onClick={() => {
                  const nextCount = rejectionCount + 1;
                  setRejectionCount(nextCount);
                  sessionStorage.setItem("projectlink-rejection-count", String(nextCount));
                  announce(`${title} ditandai tidak relevan. Feedback diterapkan.`);
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

export function OrganizationHome({ subscription }: { subscription?: import("../../types/domain/subscription").SubscriptionData }) {
  const isEnterprise = subscription?.plan === "enterprise";
  const org = subscription?.organization;
  const seatsUsed = org?.seatsUsed || 0;
  const seatsLimit = org?.seatsLimit || (isEnterprise ? "∞" : 15);
  const aiLimit = subscription?.ai?.usage?.limit;
  const aiUsed = subscription?.ai?.usage?.used || 0;
  const aiPercentage = aiLimit ? Math.round((aiUsed / aiLimit) * 100) : 0;
  const planName = isEnterprise ? "Enterprise Plan" : "Organization Plan";
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
        {subscription && (
          <div className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:p-4 tw:shadow-sm tw:min-w-[280px]">
            <h3 className="tw:text-sm tw:font-bold tw:text-slate-900 tw:mb-2">{planName}</h3>
            <p className="tw:text-xs tw:text-slate-600 tw:mb-1">{seatsUsed} dari {seatsLimit} anggota aktif</p>
            <p className="tw:text-xs tw:text-slate-600 tw:mb-3">AI usage: {aiLimit === null ? "Tak terbatas" : `${aiPercentage}%`}</p>
            <Anchor href="/organization/nusantara/billing" className="tw:inline-flex tw:items-center tw:justify-center tw:w-full tw:px-3 tw:py-1.5 tw:text-xs tw:font-semibold tw:text-slate-700 tw:bg-slate-50 hover:tw:bg-slate-100 tw:border tw:border-slate-200 tw:rounded-lg tw:transition-colors">
              Kelola organisasi
            </Anchor>
          </div>
        )}
        <div className="pl-button-row">
          <Anchor href="/home">Beralih ke personal</Anchor>
          <Anchor href="/organization/nusantara/projects" className="pl-button pl-button-primary"><Plus size={18} /> Buat peluang</Anchor>
        </div>
      </section>

      <section className="pl-org-action-grid">
        {[
          ["3", "Aplikasi baru", "Perlu ditinjau minggu ini", "Navy", "/organization/nusantara/shortlists"],
          ["1", "Persetujuan", "Offer menunggu owner", "Blue", "/organization/nusantara/pipeline"],
          ["2", "Shortlist aktif", "Dibagikan ke 4 anggota", "Teal", "/organization/nusantara/shortlists"],
          ["1", "Role belum siap", "Batasi akses sebelum mulai", "Soft", "/organization/nusantara/members"],
        ].map(([value, label, text, tone, href]) => (
          <a className={`pl-org-action ${tone.toLowerCase()}`} href={href} key={label}>
            <span>{value}</span><div><strong>{label}</strong><small>{text}</small></div><ArrowRight size={18} />
          </a>
        ))}
      </section>

      <section className="pl-main-grid pl-org-main">
        <div>
          <SectionTitle title="Pipeline kolaborasi" action={<Anchor href="/organization/nusantara/pipeline" className="pl-text-action">Buka pipeline</Anchor>} />
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
          <Anchor href="/organization/nusantara/shortlists" className="pl-text-action">Kelola shortlist</Anchor>
        </aside>
      </section>

      <section className="pl-section">
        <SectionTitle title="Proyek aktif" action={<Anchor href="/organization/nusantara/projects" className="pl-text-action">Lihat semua</Anchor>} />
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
        <form action="/organization/nusantara/search">
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
      <SectionTitle eyebrow="Milestone 1" title="TautIn Design System" description="Fondasi visual untuk seluruh layar: profesional, evidence-led, dan tidak terasa seperti marketplace generik." />
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
