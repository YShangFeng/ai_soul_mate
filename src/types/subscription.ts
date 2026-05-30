// ============================================
// SoulMate.ai — Subscription Type Definitions
// ============================================

export type SubscriptionStatus = "free" | "trialing" | "active" | "past_due" | "canceled";

export type SubscriptionPlan = "free" | "pro";

/** Full subscription entity */
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Pricing plan for display */
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "week";
  popular?: boolean;
  features: string[];
  stripePriceId: string;
}

/** Maps snake_case DB row to camelCase Subscription */
export function mapSubscriptionRow(row: {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    status: row.status as SubscriptionStatus,
    plan: row.plan as SubscriptionPlan,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
