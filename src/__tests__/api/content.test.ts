/**
 * Tests for content CRUD endpoint:
 *   GET  /api/content
 *   POST /api/content
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

const MOCK_SESSION = { user: { id: 'user-uuid-content', email: 'content@example.com' } };

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_CONTENT = {
  type: 'sermon' as const,
  title: 'Sunday Message',
  generatedContent: 'Content here',
};

describe('GET /api/content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { GET } = await import('@/app/api/content/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns an array for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    // The route chains: db.select().from().where().orderBy() — make it resolve
    (mockDb.orderBy as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', title: 'My Sermon', userId: MOCK_SESSION.user.id },
    ]);
    const { GET } = await import('@/app/api/content/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

describe('POST /api/content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.returning as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'content-uuid-1', ...VALID_CONTENT, userId: MOCK_SESSION.user.id, status: 'generated' },
    ]);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/content/route');
    const res = await POST(makeRequest(VALID_CONTENT));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid content type', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/content/route');
    const res = await POST(makeRequest({ ...VALID_CONTENT, type: 'blog' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty title', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/content/route');
    const res = await POST(makeRequest({ ...VALID_CONTENT, title: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 and new content record for valid authenticated request', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/content/route');
    const res = await POST(makeRequest(VALID_CONTENT));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body.userId).toBe(MOCK_SESSION.user.id);
  });

  it('stamps the session userId — cannot forge another user\'s content', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/content/route');
    const res = await POST(makeRequest({ ...VALID_CONTENT, userId: 'attacker-id' }));
    const body = await res.json();
    expect(body.userId).toBe(MOCK_SESSION.user.id);
  });

  it('accepts all valid content types', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/content/route');
    for (const type of ['devotional', 'sermon', 'social'] as const) {
      const res = await POST(makeRequest({ type, title: 'Test' }));
      expect(res.status).toBe(200);
    }
  });
});
