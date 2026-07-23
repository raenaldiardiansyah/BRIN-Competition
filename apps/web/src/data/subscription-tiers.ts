import type { SubscriptionPlan, AIFeatureId, PersonaState } from "@/types/domain/subscription";

export interface TierDefinition {
  id: SubscriptionPlan;
  label: string;
  tagline: string;
  audience: string;
  iconKey: 'rocket' | 'sparkle' | 'buildings' | 'shield';
  features: string[];
  capabilities: string[];
  limitations: string[];
  pricing: {
    monthly: number | null;    // null = "Hubungi kami"
    yearly: number | null;
    display: string;
    label: string;
  };
  ctaLabel: string;
  ctaRoute: string;
}

/**
 * Prototype-only values.
 * Not approved pricing or production usage policy.
 */
export const PROTOTYPE_LIMITS = {
  free: 10,
  pro: 50,
  organization: 250,
} as const;

export const tierMatrix: Record<Exclude<SubscriptionPlan, "none">, TierDefinition> = {
  free: {
    id: "free",
    label: "Free Core",
    tagline: "Bangun project portfolio dan mulai kolaborasi.",
    audience: "Individu yang mulai membangun profil, proyek, contribution, dan evidence.",
    iconKey: "rocket",
    features: ["Profil & proyek dasar", "Contribution + evidence", "Alasan matching dasar", "Kolaborasi dalam batas wajar"],
    capabilities: ["Profil dan proyek dasar", "Contribution dan evidence", "Matching dasar", "Kolaborasi terbatas"],
    limitations: ["Analytics dibatasi", "Saved search tidak tersedia"],
    pricing: {
      monthly: 0,
      yearly: 0,
      display: "Rp0",
      label: "Simulasi harga prototype"
    },
    ctaLabel: "Mulai sekarang",
    ctaRoute: "/register"
  },
  pro: {
    id: "pro",
    label: "Pro Individual",
    tagline: "Tingkatkan kapasitas, insight, AI assistance, dan matching personal.",
    audience: "Profesional, peneliti, dan inovator individual.",
    iconKey: "sparkle",
    features: ["Matching lebih rinci", "Saved search & alerts", "Analytics personal", "AI assistance lebih luas"],
    capabilities: ["Matching lebih dalam", "AI assistance", "Personal analytics", "Saved workflow", "Research Gap", "Novelty Checker", "Riwayat analisis Pro"],
    limitations: ["Tidak mencakup shared workspace dan workflow tim Organization."],
    pricing: {
      monthly: 49000,
      yearly: null,
      display: "Rp49.000–Rp99.000/bulan",
      label: "Simulasi harga prototype"
    },
    ctaLabel: "Kelola langganan",
    ctaRoute: "/subscription?mode=compare&plan=pro"
  },
  organization: {
    id: "organization",
    label: "Organization",
    tagline: "Kelola matching, shortlist, pipeline, dan kolaborasi bersama tim.",
    audience: "Startup, tim inovasi, laboratorium, inkubator, organisasi kecil, dan tim riset.",
    iconKey: "buildings",
    features: ["Seat & permission", "Shared shortlist", "Pipeline & approval", "Reporting organisasi"],
    capabilities: ["Seat dan permission", "Shared shortlist", "Shared pipeline", "Approval workflow", "Team analytics", "Reporting", "Industry Matching", "Funding Recommendation", "Commercialization Assistant"],
    limitations: ["Preview tidak mengaktifkan workspace, entitlement, atau transaksi Organization."],
    pricing: {
      monthly: 99000,
      yearly: null,
      display: "Rp99.000–Rp299.000/bulan",
      label: "Simulasi harga prototype"
    },
    ctaLabel: "Lihat preview Organization",
    ctaRoute: "/subscription?mode=compare&plan=organization"
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise / Custom",
    tagline: "Integrasikan workflow, security, analytics, dan private ecosystem.",
    audience: "Perusahaan besar, universitas, pemerintah, lembaga riset, dan consortium.",
    iconKey: "shield",
    features: ["SSO & API", "Custom policy", "Full audit", "SLA & integration"],
    capabilities: ["SSO dan API", "Integration", "Custom policy", "Full audit", "Private ecosystem", "SLA"],
    limitations: ["Bukan paket checkout self-service; konfigurasi final memerlukan pembahasan kebutuhan institusi."],
    pricing: {
      monthly: null,
      yearly: null,
      display: "Rp1.000.000–Rp5.000.000/bulan atau custom",
      label: "Simulasi harga prototype"
    },
    ctaLabel: "Lihat preview Enterprise",
    ctaRoute: "/subscription?mode=compare&plan=enterprise"
  }
};

export const AI_FEATURE_MATRIX: Record<AIFeatureId, { name: string; description: string; access: Record<Exclude<SubscriptionPlan, "none">, "available" | "limited" | "locked">; quotaCost?: number }> = {
  "explainable-matching": {
    name: "Explainable Matching",
    description: "Alasan mengapa profil atau proyek cocok untuk Anda.",
    access: { free: "available", pro: "available", organization: "available", enterprise: "available" },
    quotaCost: 1,
  },
  "project-assistant": {
    name: "Project Assistant",
    description: "Asisten AI untuk membantu penyusunan deskripsi proyek dan dokumen.",
    access: { free: "limited", pro: "available", organization: "available", enterprise: "available" },
    quotaCost: 2,
  },
  "gap-analysis": {
    name: "Gap Analysis",
    description: "Analisis kesenjangan pada profil tim untuk melihat kebutuhan kolaborasi.",
    access: { free: "locked", pro: "available", organization: "available", enterprise: "available" },
    quotaCost: 2,
  },
  "recommendation-history": {
    name: "Recommendation History",
    description: "Riwayat rekomendasi yang pernah Anda terima.",
    access: { free: "locked", pro: "available", organization: "available", enterprise: "available" },
    quotaCost: 1,
  },
  "portfolio-insight": {
    name: "Portfolio Insight",
    description: "Wawasan mendalam terhadap kekuatan portofolio organisasi atau individu.",
    access: { free: "limited", pro: "available", organization: "available", enterprise: "available" },
    quotaCost: 5,
  },
  "organization-comparison": {
    name: "Organization Comparison",
    description: "Bandingkan kemampuan tim secara agregat.",
    access: { free: "locked", pro: "locked", organization: "available", enterprise: "available" },
    quotaCost: 5,
  },
  "decision-summary": {
    name: "Decision Summary",
    description: "Ringkasan data untuk pengambilan keputusan hiring/partnership.",
    access: { free: "locked", pro: "available", organization: "available", enterprise: "available" },
    quotaCost: 3,
  }
};

export const ALLOWED_PLANS_BY_CONTEXT = {
  guest: ['none'],
  new: ['free'],
  returning: ['free', 'pro'],
  organization: ['organization', 'enterprise'],
} as const;

export function resolveSubscriptionPlan(
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
