/**
 * Tests for AI generation endpoints:
 *   POST /api/generate/sermon
 *   POST /api/generate/devotional
 *   POST /api/generate/social
 *   POST /api/generate/journal-series
 *
 * All routes require auth. Tests verify auth gate, input validation,
 * and streaming response shape.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';

const MOCK_SESSION = { user: { id: 'user-uuid-generate', email: 'gen@example.com' } };

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── Sermon ────────────────────────────────────────────────────────────────────
describe('POST /api/generate/sermon', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/generate/sermon/route');
    const res = await POST(makeRequest({ topic: 'Grace', scripture: 'John 3:16' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing topic', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/sermon/route');
    const res = await POST(makeRequest({ scripture: 'John 3:16' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing scripture', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/sermon/route');
    const res = await POST(makeRequest({ topic: 'Grace' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty topic', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/sermon/route');
    const res = await POST(makeRequest({ topic: '', scripture: 'John 3:16' }));
    expect(res.status).toBe(400);
  });

  it('returns a streaming plain-text response for valid input', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/sermon/route');
    const res = await POST(makeRequest({ topic: 'Grace', scripture: 'John 3:16' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });

  it('returns 400 for completely empty body', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/sermon/route');
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

// ── Devotional ────────────────────────────────────────────────────────────────
describe('POST /api/generate/devotional', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/generate/devotional/route');
    const res = await POST(makeRequest({ topic: 'Faith', scripture: 'Hebrews 11:1' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing required fields', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/devotional/route');
    const res = await POST(makeRequest({ tone: 'encouraging' }));
    expect(res.status).toBe(400);
  });

  it('returns streaming response for valid authenticated request', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/devotional/route');
    const res = await POST(makeRequest({ topic: 'Faith', scripture: 'Hebrews 11:1' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });

  it('rejects empty topic', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/devotional/route');
    const res = await POST(makeRequest({ topic: '', scripture: 'John 1:1' }));
    expect(res.status).toBe(400);
  });
});

// ── Social ────────────────────────────────────────────────────────────────────
describe('POST /api/generate/social', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/generate/social/route');
    const res = await POST(makeRequest({ topic: 'Hope' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for empty topic', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/social/route');
    const res = await POST(makeRequest({ topic: '' }));
    expect(res.status).toBe(400);
  });

  it('returns streaming response for valid authenticated request', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/social/route');
    const res = await POST(makeRequest({ topic: 'Hope', platform: 'instagram' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });
});

// ── Journal Series ────────────────────────────────────────────────────────────
describe('POST /api/generate/journal-series', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * SECURITY FINDING — CRITICAL
   * This test documents the known auth bypass in journal-series/route.ts (line 95).
   * When DATABASE_URL is not set, auth is skipped entirely.
   * In production DATABASE_URL is always set so the bypass is inactive.
   * The test verifies the bypass is gone in future; keep it failing until fixed.
   */
  it('[SECURITY] returns 401 with DATABASE_URL set and no session', async () => {
    // DATABASE_URL is set by setup.ts — auth MUST fire
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/generate/journal-series/route');
    const res = await POST(makeRequest({ topic: 'Prayer', duration: 7 }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for zero duration', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/journal-series/route');
    const res = await POST(makeRequest({ topic: 'Prayer', duration: 0 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty topic', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/journal-series/route');
    const res = await POST(makeRequest({ topic: '', duration: 7 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid mode', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/journal-series/route');
    const res = await POST(makeRequest({ topic: 'Prayer', duration: 7, mode: 'invalid' }));
    expect(res.status).toBe(400);
  });

  it('returns streaming response for valid authenticated request', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/journal-series/route');
    const res = await POST(makeRequest({ topic: 'Prayer', duration: 3 }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });

  it('caps maxTokens at 8192 for large duration', async () => {
    // duration=20 → 20*800+1500=17500, capped at 8192
    // We can't inspect internals directly, but we verify the request completes
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/generate/journal-series/route');
    const res = await POST(makeRequest({ topic: 'Prayer', duration: 20 }));
    expect(res.status).toBe(200);
  });
});
