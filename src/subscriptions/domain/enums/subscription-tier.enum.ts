export enum SubscriptionTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export const TIER_CONFIG: Record<SubscriptionTier, { maxMessages: number; monthlyPrice: number }> =
  {
    [SubscriptionTier.BASIC]: { maxMessages: 10, monthlyPrice: 9.99 },
    [SubscriptionTier.PRO]: { maxMessages: 100, monthlyPrice: 29.99 },
    [SubscriptionTier.ENTERPRISE]: { maxMessages: -1, monthlyPrice: 99.99 }, // -1 = unlimited
  };
