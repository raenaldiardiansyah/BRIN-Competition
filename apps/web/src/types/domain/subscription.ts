// === PERSONA (independen dari subscription) ===
export type PersonaState = 'guest' | 'new' | 'returning' | 'organization';

// === SUBSCRIPTION LIFECYCLE ===
export type SubscriptionPlan = 'none' | 'free' | 'pro' | 'organization' | 'enterprise';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'expired';

// === PAYMENT (domain terpisah) ===
export type PaymentStatus =
  | 'not_applicable'   // Free plan
  | 'current'
  | 'past_due'
  | 'failed';

// === AI USAGE (domain terpisah) ===
export type AIUsageStatus =
  | 'normal'
  | 'near_limit'
  | 'limit_reached';

export type AIFeatureAccess = 'available' | 'limited' | 'locked';

export type AIFeatureId =
  | 'explainable-matching'
  | 'project-assistant'
  | 'gap-analysis'
  | 'recommendation-history'
  | 'portfolio-insight'
  | 'organization-comparison'
  | 'decision-summary';

// === BILLING ===
export type BillingCycle = 'monthly' | 'yearly';

// === COMPOSITE ===
export interface AIUsage {
  used: number;
  limit: number | null;        // null = unlimited / custom
  resetAt?: string;            // ISO date
  statusOverride?: AIUsageStatus; // Hanya untuk prototype override
}

// Helper: derive status dinamis dari used/limit
export function deriveAIUsageStatus(usage: AIUsage): AIUsageStatus {
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

export interface SubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
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

// === INVOICE ===
export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'void';

export interface PrototypeInvoice {
  id: string;
  label: 'Contoh invoice';     // prototype guard
  issuedAt: string;             // ISO date
  amount: number;
  status: InvoiceStatus;
  billingCycle: BillingCycle;
}

// === BILLING CONTACT ===
export interface BillingContact {
  name: string;
  email: string;
  organization?: string;
}

// === ORGANIZATION BILLING PERMISSION ===
export interface OrganizationBillingPermission {
  canViewPlan: boolean;
  canViewInvoices: boolean;
  canManageBilling: boolean;
}

// === PROTOTYPE OVERRIDES ===
export interface SubscriptionSessionOverride {
  scenarioOverride?:
    | 'default'
    | 'near_limit'
    | 'limit_reached'
    | 'payment_failed'
    | 'cancel_scheduled'
    | 'expired';
  planOverride?: SubscriptionPlan;
  aiUsageDelta?: number;
  cancelReason?: string;
}
