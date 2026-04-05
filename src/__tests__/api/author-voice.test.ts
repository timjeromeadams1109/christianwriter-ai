/**
 * Tests for author voice endpoints:
 *   GET  /api/author-voice
 *   POST /api/author-voice/analyze
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

const MOCK_SESSION = { user: { id: 'user-uuid-voice', email: 'voice@example.com' } };
const LONG_SAMPLE = 'A'.repeat(500);

function makeAnalyzeRequest(body: unknown): Request {
  return new Request('http://localhost/api/author-voice/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── GET /api/author-voice ──────────────────────────────────────────────────────
describe('GET /api/author-voice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { GET } = await import('@/app/api/author-voice/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns list of profiles for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.orderBy as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'profile-1', name: 'My Voice', userId: MOCK_SESSION.user.id },
    ]);
    const { GET } = await import('@/app/api/author-voice/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

// ── POST /api/author-voice/analyze ────────────────────────────────────────────
describe('POST /api/author-voice/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = getDb() as Record<string, unknown>;
    (mockDb.returning as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'profile-uuid-1',
        userId: MOCK_SESSION.user.id,
        name: 'My Voice',
        voiceCharacteristics: {
          tone: ['warm'],
          style: [],
          vocabulary: [],
          sentenceStructure: 'medium',
          rhetoricalDevices: [],
          summary: 'Pastoral.',
        },
      },
    ]);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/author-voice/analyze/route');
    const res = await POST(makeAnalyzeRequest({ name: 'Voice', sampleText: LONG_SAMPLE }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when sample text is under 500 chars', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/author-voice/analyze/route');
    const res = await POST(makeAnalyzeRequest({ name: 'Voice', sampleText: 'Too short' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty name', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/author-voice/analyze/route');
    const res = await POST(makeAnalyzeRequest({ name: '', sampleText: LONG_SAMPLE }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing name', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/author-voice/analyze/route');
    const res = await POST(makeAnalyzeRequest({ sampleText: LONG_SAMPLE }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with voice profile for valid authenticated request', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/author-voice/analyze/route');
    const res = await POST(makeAnalyzeRequest({ name: 'My Voice', sampleText: LONG_SAMPLE }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('voiceCharacteristics');
  });

  it('stamps session userId on the saved profile', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/author-voice/analyze/route');
    const res = await POST(makeAnalyzeRequest({ name: 'My Voice', sampleText: LONG_SAMPLE }));
    const body = await res.json();
    expect(body.userId).toBe(MOCK_SESSION.user.id);
  });
});
