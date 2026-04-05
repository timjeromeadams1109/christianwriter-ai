/**
 * Tests for POST /api/webhooks/stripe
 * Uses Stripe signature verification — NOT session auth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

// The global setup mocks next/headers to return 'test_sig' for stripe-signature.
// Individual tests that need to vary the signature override the stripe mock.

function makeWebhookRequest(body: string): Request {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test_sig',
    },
    body,
  });
}

const MOCK_SUBSCRIPTION_UPDATED: Stripe.Event = {
  id: 'evt_test',
  object: 'event',
  type: 'customer.subscription.updated',
  data: {
    object: {
      id: 'sub_test',
      object: 'subscription',
      customer: 'cus_test',
      status: 'active',
      items: { data: [{ price: { id: 'price_pro_test' } }] },
    } as unknown as Stripe.Subscription,
  },
  api_version: '2024-06-20',
  created: 0,
  livemode: false,
  pending_webhooks: 0,
  request: null,
};

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when Stripe signature verification fails', async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error('Signature verification failed');
    });
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeWebhookRequest('{}') as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('verification failed');
  });

  it('returns 200 and processes customer.subscription.updated', async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
      MOCK_SUBSCRIPTION_UPDATED as never
    );
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeWebhookRequest('{}') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it('returns 200 and processes customer.subscription.deleted (downgrade to free)', async () => {
    const deletedEvent = {
      ...MOCK_SUBSCRIPTION_UPDATED,
      type: 'customer.subscription.deleted',
    };
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(deletedEvent as never);
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeWebhookRequest('{}') as never);
    expect(res.status).toBe(200);
  });

  it('returns 200 for unknown event types (must not throw)', async () => {
    const unknownEvent = { ...MOCK_SUBSCRIPTION_UPDATED, type: 'customer.source.created' };
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(unknownEvent as never);
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeWebhookRequest('{}') as never);
    expect(res.status).toBe(200);
  });

  it('returns 200 and handles checkout.session.completed', async () => {
    const checkoutEvent: Stripe.Event = {
      ...MOCK_SUBSCRIPTION_UPDATED,
      type: 'checkout.session.completed',
      data: {
        object: {
          object: 'checkout.session',
          mode: 'subscription',
          subscription: 'sub_test123',
          customer: 'cus_test123',
        } as unknown as Stripe.Checkout.Session,
      },
    };
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(checkoutEvent as never);
    const { POST } = await import('@/app/api/webhooks/stripe/route');
    const res = await POST(makeWebhookRequest('{}') as never);
    expect(res.status).toBe(200);
  });
});
