import type { SubscriptionData, PrototypeInvoice, SubscriptionSessionOverride, PersonaState } from "@/types/domain/subscription";
import { PROTOTYPE_LIMITS, resolveSubscriptionPlan } from "@/data/subscription-tiers";

export const guestSubscription: SubscriptionData = {
  plan: "none",
  status: null,
  paymentStatus: "not_applicable",
  ai: {
    usage: { used: 0, limit: 0 },
    capabilities: [],
  },
};

export const newUserSubscription: SubscriptionData = {
  plan: "free",
  status: "active",
  paymentStatus: "not_applicable",
  ai: {
    usage: { used: 3, limit: PROTOTYPE_LIMITS.free },
    capabilities: ["explainable-matching"],
  },
};

export const returningUserSubscription: SubscriptionData = {
  plan: "pro",
  status: "active",
  paymentStatus: "current",
  billingCycle: "monthly",
  renewalDate: "2026-08-21T00:00:00Z",
  ai: {
    usage: { used: 14, limit: PROTOTYPE_LIMITS.pro },
    capabilities: [
      "explainable-matching",
      "project-assistant",
      "gap-analysis",
      "recommendation-history",
      "decision-summary"
    ],
  },
};

export const organizationSubscription: SubscriptionData = {
  plan: "organization",
  status: "active",
  paymentStatus: "current",
  billingCycle: "yearly",
  renewalDate: "2027-01-01T00:00:00Z",
  ai: {
    usage: { used: 85, limit: PROTOTYPE_LIMITS.organization },
    capabilities: [
      "explainable-matching",
      "project-assistant",
      "gap-analysis",
      "recommendation-history",
      "decision-summary",
      "portfolio-insight",
      "organization-comparison"
    ],
  },
  organization: {
    seatsUsed: 8,
    seatsLimit: 15,
    aiUsage: { used: 85, limit: PROTOTYPE_LIMITS.organization },
  }
};

export const invoiceHistory: PrototypeInvoice[] = [
  {
    id: "INV-2026-07-001",
    label: "Contoh invoice",
    issuedAt: "2026-07-21T00:00:00Z",
    amount: 99000,
    status: "paid",
    billingCycle: "monthly",
  },
  {
    id: "INV-2026-06-001",
    label: "Contoh invoice",
    issuedAt: "2026-06-21T00:00:00Z",
    amount: 99000,
    status: "paid",
    billingCycle: "monthly",
  },
  {
    id: "INV-2026-05-001",
    label: "Contoh invoice",
    issuedAt: "2026-05-21T00:00:00Z",
    amount: 99000,
    status: "paid",
    billingCycle: "monthly",
  },
];

export const scenarioFixtures = {
  proLimitReached: {
    ...returningUserSubscription,
    ai: {
      ...returningUserSubscription.ai,
      usage: { used: 50, limit: PROTOTYPE_LIMITS.pro, statusOverride: "limit_reached" }
    }
  } as SubscriptionData,
  proNearLimit: {
    ...returningUserSubscription,
    ai: {
      ...returningUserSubscription.ai,
      usage: { used: 45, limit: PROTOTYPE_LIMITS.pro, statusOverride: "near_limit" }
    }
  } as SubscriptionData,
  proPastDue: {
    ...returningUserSubscription,
    status: "past_due",
    paymentStatus: "past_due"
  } as SubscriptionData,
  organizationMember: {
    ...organizationSubscription,
    // Organization member typically shouldn't see full billing details, just usage and active status
  } as SubscriptionData,
  enterpriseInquiry: {
    plan: "enterprise",
    status: "trialing", // Prototype state for inquiry
    paymentStatus: "not_applicable",
    ai: {
      usage: { used: 0, limit: null },
      capabilities: []
    }
  } as SubscriptionData
};

export function resolveSubscriptionState(
  persona: PersonaState,
  fixture: SubscriptionData,
  overrides: SubscriptionSessionOverride
): SubscriptionData {
  const result: SubscriptionData = {
    ...fixture,
    ai: {
      ...fixture.ai,
      usage: { ...fixture.ai.usage }
    }
  };

  if (overrides.planOverride) {
    result.plan = resolveSubscriptionPlan(persona, overrides.planOverride, fixture.plan);
  }

  if (overrides.aiUsageDelta && result.ai.usage.limit !== null) {
    result.ai.usage.used = Math.max(0, Math.min(result.ai.usage.limit, result.ai.usage.used + overrides.aiUsageDelta));
  }

  if (overrides.scenarioOverride && overrides.scenarioOverride !== 'default') {
    switch (overrides.scenarioOverride) {
      case 'near_limit':
        if (result.ai.usage.limit !== null) {
          result.ai.usage.used = Math.floor(result.ai.usage.limit * 0.9);
          result.ai.usage.statusOverride = 'near_limit';
        }
        break;
      case 'limit_reached':
        if (result.ai.usage.limit !== null) {
          result.ai.usage.used = result.ai.usage.limit;
          result.ai.usage.statusOverride = 'limit_reached';
        }
        break;
      case 'payment_failed':
        result.status = 'past_due';
        result.paymentStatus = 'failed';
        break;
      case 'cancel_scheduled':
        result.status = 'canceled';
        result.cancelDate = result.renewalDate || new Date().toISOString();
        break;
      case 'expired':
        result.status = 'expired';
        result.paymentStatus = 'not_applicable';
        break;
    }
  }

  return result;
}
