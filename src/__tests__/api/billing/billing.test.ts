/**
 * Tests for billing endpoints:
 *   POST /api/checkout
 *   POST /api/billing-portal
 *   GET  /api/user/subscription
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { stripe } from '@/lib/stripe';

const MOCK_SESSION = { user: { id: 'user-uuid-billing', email: 'billing@example.com' } };

function makeRequest(body: unknown, url = 'http://localhost/api/checkout'): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest({ tier: 'pro' }) as never);
    expect(res.status).toBe(401);
  });

  it('returns 400 for free tier (cannot buy free)', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        id: MOCK_SESSION.user.id,
        email: MOCK_SESSION.user.email,
        stripeCustomerId: null,
      });
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest({ tier: 'free' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing tier', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it('returns 200 with Stripe checkout URL for valid pro tier', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        id: MOCK_SESSION.user.id,
        email: MOCK_SESSION.user.email,
        name: 'Test User',
        stripeCustomerId: 'cus_existing123',
      });
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest({ tier: 'pro' }) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('url');
    expect(body.url).toContain('stripe.com');
  });

  it('creates a new Stripe customer when none exists', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        id: MOCK_SESSION.user.id,
        email: MOCK_SESSION.user.email,
        name: 'New User',
        stripeCustomerId: null,
      });
    const { POST } = await import('@/app/api/checkout/route');
    await POST(makeRequest({ tier: 'pro' }) as never);
    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: MOCK_SESSION.user.email })
    );
  });

  it('returns 404 when user not found in DB', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue(undefined);
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest({ tier: 'pro' }) as never);
    expect(res.status).toBe(404);
  });
});

// ── POST /api/billing-portal ──────────────────────────────────────────────────
describe('POST /api/billing-portal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/billing-portal/route');
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 400 when user has no Stripe customer ID', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        id: MOCK_SESSION.user.id,
        stripeCustomerId: null,
      });
    const { POST } = await import('@/app/api/billing-portal/route');
    const res = await POST();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('No billing information');
  });

  it('returns 200 with billing portal URL', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        id: MOCK_SESSION.user.id,
        stripeCustomerId: 'cus_test123',
      });
    const { POST } = await import('@/app/api/billing-portal/route');
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('url');
  });
});

// ── GET /api/user/subscription ────────────────────────────────────────────────
describe('GET /api/user/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { GET } = await import('@/app/api/user/subscription/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found in DB', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue(undefined);
    const { GET } = await import('@/app/api/user/subscription/route');
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it('returns subscription data for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        subscriptionTier: 'pro',
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_sensitive_id',
      });
    const { GET } = await import('@/app/api/user/subscription/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subscriptionTier).toBe('pro');
    expect(body.subscriptionStatus).toBe('active');
  });

  it('defaults subscriptionTier to free when null', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.query as Record<string, unknown> & { users: { findFirst: ReturnType<typeof vi.fn> } })
      .users.findFirst.mockResolvedValue({
        subscriptionTier: null,
        subscriptionStatus: null,
        stripeCustomerId: null,
      });
    const { GET } = await import('@/app/api/user/subscription/route');
    const res = await GET();
    const body = await res.json();
    expect(body.subscriptionTier).toBe('free');
  });
});
