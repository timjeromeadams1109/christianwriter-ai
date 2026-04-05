/**
 * Global test setup — runs before every test file.
 *
 * vi.mock() factories are hoisted by vitest. The `vi` global is available
 * inside factories even though they are hoisted. Do NOT use top-level
 * variables from this module's scope inside factories.
 */

import { vi } from 'vitest';

// ── next/headers ──────────────────────────────────────────────────────────────
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === 'x-forwarded-for') return '127.0.0.1';
      if (name === 'stripe-signature') return 'test_sig';
      return null;
    }),
  }),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// ── @/lib/db ──────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => {
  const orderBy = vi.fn().mockResolvedValue([]);
  const returning = vi.fn().mockResolvedValue([]);
  const findFirst = vi.fn().mockResolvedValue(undefined);

  const chain = {
    query: {
      users: { findFirst },
      content: { findFirst: vi.fn().mockResolvedValue(undefined) },
    },
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    orderBy,
    insert: vi.fn(),
    values: vi.fn(),
    returning,
    update: vi.fn(),
    set: vi.fn(),
  };

  // Wire up the chain: each method returns the same object
  chain.select = vi.fn().mockReturnValue(chain);
  chain.from = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.values = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.set = vi.fn().mockReturnValue(chain);

  return {
    db: chain,
    getDb: vi.fn(() => chain),
    users: {},
    content: {},
    authorVoiceProfiles: {},
  };
});

// ── @/lib/auth ────────────────────────────────────────────────────────────────
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// ── @/lib/ratelimit ───────────────────────────────────────────────────────────
vi.mock('@/lib/ratelimit', () => ({
  loginRatelimit: null,
  mfaRatelimit: null,
  registerRatelimit: null,
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

// ── @anthropic-ai/sdk — use function keyword so `new Anthropic()` works ───────
vi.mock('@anthropic-ai/sdk', () => {
  const mockStream = {
    [Symbol.asyncIterator]: async function* () {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Generated content chunk' } };
    },
  };
  const messages = {
    create: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: '{"tone":["warm"],"style":["narrative"],"vocabulary":["biblical"],"sentenceStructure":"medium","rhetoricalDevices":["questions"],"summary":"Pastoral voice."}' }],
    }),
    stream: vi.fn().mockReturnValue(mockStream),
  };
  function AnthropicConstructor() { return { messages }; }
  return { default: AnthropicConstructor };
});

// ── @stack/core ───────────────────────────────────────────────────────────────
vi.mock('@stack/core', () => {
  const breaker = {
    fire: vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Generated' }] }),
    on: vi.fn(),
    isHealthy: vi.fn().mockReturnValue(true),
    getStats: vi.fn().mockReturnValue({}),
  };
  return { createCircuitBreaker: vi.fn().mockReturnValue(breaker) };
});

// ── @/lib/stripe ──────────────────────────────────────────────────────────────
vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: vi.fn().mockResolvedValue({ id: 'cus_test123' }) },
    checkout: { sessions: { create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test', id: 'cs_test123' }) } },
    billingPortal: { sessions: { create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }) } },
    webhooks: { constructEvent: vi.fn() },
    subscriptions: { retrieve: vi.fn().mockResolvedValue({ id: 'sub_test123', status: 'active', items: { data: [{ price: { id: 'price_pro_test' } }] } }) },
  },
}));
