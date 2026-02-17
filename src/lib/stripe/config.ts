// Stripe price IDs mapping
// These should be created in the Stripe Dashboard and the IDs added to .env.local

export type SubscriptionTier = 'free' | 'pro' | 'ministry';

export const PRICE_IDS: Record<Exclude<SubscriptionTier, 'free'>, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,       // $19/month
  ministry: process.env.STRIPE_PRICE_MINISTRY, // $49/month
};

export const TIER_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  ministry: 'Ministry',
};

export const TIER_PRICES: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 19,
  ministry: 49,
};

// Map Stripe price IDs back to tiers
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_MINISTRY) return 'ministry';
  return 'free';
}

// Get the price ID for a tier
export function getPriceIdForTier(tier: SubscriptionTier): string | undefined {
  if (tier === 'free') return undefined;
  return PRICE_IDS[tier];
}
