import type { SubscriptionPlan, AIFeatureId, PersonaState } from "@/types/domain/subscription";

export interface TierDefinition {
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
    tagline: "Satu journey inti tetap berguna",
    iconKey: "rocket",
    features: ["Profil & proyek dasar", "Contribution + evidence", "Alasan matching dasar", "Kolaborasi dalam batas wajar"],
    limitations: ["Analytics dibatasi", "Saved search tidak tersedia"],
    pricing: {
      monthly: 0,
      yearly: 0,
      label: "Prototype pricing"
    },
    ctaLabel: "Mulai sekarang",
    ctaRoute: "/register"
  },
  pro: {
    id: "pro",
    label: "Pro Individual",
    tagline: "Kedalaman dan kapasitas",
    iconKey: "sparkle",
    features: ["Matching lebih rinci", "Saved search & alerts", "Analytics personal", "AI assistance lebih luas"],
    limitations: [],
    pricing: {
      monthly: 99000,
      yearly: 990000,
      label: "Prototype pricing"
    },
    ctaLabel: "Kelola langganan",
    ctaRoute: "/subscription"
  },
  organization: {
    id: "organization",
    label: "Organization",
    tagline: "Kontrol dan kolaborasi tim",
    iconKey: "buildings",
    features: ["Seat & permission", "Shared shortlist", "Pipeline & approval", "Reporting organisasi"],
    limitations: [],
    pricing: {
      monthly: 499000,
      yearly: 4990000,
      label: "Prototype pricing"
    },
    ctaLabel: "Kelola billing",
    ctaRoute: "/organization/nusantara/billing"
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise / Custom",
    tagline: "Roadmap untuk kebutuhan khusus",
    iconKey: "shield",
    features: ["SSO & API", "Custom policy", "Full audit", "SLA & integration"],
    limitations: [],
    pricing: {
      monthly: null,
      yearly: null,
      label: "Prototype pricing"
    },
    ctaLabel: "Lihat paket organisasi",
    ctaRoute: "/plans/organization"
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
    access: { free: "locked", pro: "locked", organization: "available", enterprise: "available" },
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
