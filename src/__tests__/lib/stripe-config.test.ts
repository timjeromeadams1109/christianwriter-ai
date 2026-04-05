/**
 * Tests for Stripe tier/price ID mapping in src/lib/stripe/config.ts
 */

import { describe, it, expect } from 'vitest';
import { getTierFromPriceId, getPriceIdForTier } from '@/lib/stripe/config';

describe('getTierFromPriceId', () => {
  it('returns pro for the pro price ID', () => {
    expect(getTierFromPriceId('price_pro_test')).toBe('pro');
  });

  it('returns ministry for the ministry price ID', () => {
    expect(getTierFromPriceId('price_ministry_test')).toBe('ministry');
  });

  it('returns free for unknown price ID', () => {
    expect(getTierFromPriceId('price_unknown')).toBe('free');
  });
});

describe('getPriceIdForTier', () => {
  it('returns price ID for pro tier', () => {
    expect(getPriceIdForTier('pro')).toBe('price_pro_test');
  });

  it('returns price ID for ministry tier', () => {
    expect(getPriceIdForTier('ministry')).toBe('price_ministry_test');
  });

  it('returns undefined for free tier', () => {
    expect(getPriceIdForTier('free')).toBeUndefined();
  });
});
