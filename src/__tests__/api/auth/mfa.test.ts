/**
 * Tests for MFA API routes:
 *   POST /api/auth/mfa/setup
 *   POST /api/auth/mfa/verify-setup
 *   POST /api/auth/mfa/verify
 *   POST /api/auth/mfa/disable
 *   GET  /api/user/mfa-status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import {
  encryptSecret,
  generateTOTPSecret,
  generateBackupCodes,
  hashBackupCode,
} from '@/lib/mfa';

const MOCK_USER_ID = 'user-uuid-mfa-test';
const MOCK_SESSION = { user: { id: MOCK_USER_ID, email: 'mfa@example.com' } };

function makeRequest(body?: unknown): Request {
  return new Request('http://localhost/api/auth/mfa/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ── /api/auth/mfa/setup ────────────────────────────────────────────────────────
describe('POST /api/auth/mfa/setup', () => {
  let mockDb: ReturnType<typeof getDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = getDb();
    vi.mocked(mockDb.update({} as never).set({} as never).where).mockResolvedValue(undefined as never);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/auth/mfa/setup/route');
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns uri and secret on success', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/auth/mfa/setup/route');
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('uri');
    expect(body).toHaveProperty('secret');
    expect(body.uri).toMatch(/^otpauth:\/\/totp\//);
  });
});

// ── /api/auth/mfa/verify-setup ────────────────────────────────────────────────
describe('POST /api/auth/mfa/verify-setup', () => {
  let mockDb: ReturnType<typeof getDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = getDb();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/auth/mfa/verify-setup/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for non-6-digit code', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/auth/mfa/verify-setup/route');
    const res = await POST(makeRequest({ code: '12345' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when MFA already enabled', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: true,
      mfaSecret: encryptSecret(generateTOTPSecret()),
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/verify-setup/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(409);
  });

  it('returns 400 when no pending setup secret exists', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: false,
      mfaSecret: null,
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/verify-setup/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('setup first');
  });

  it('returns 400 for wrong TOTP code', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: false,
      mfaSecret: encryptSecret(generateTOTPSecret()),
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/verify-setup/route');
    const res = await POST(makeRequest({ code: '000000' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid code');
  });
});

// ── /api/auth/mfa/verify ──────────────────────────────────────────────────────
describe('POST /api/auth/mfa/verify', () => {
  let mockDb: ReturnType<typeof getDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = getDb();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/auth/mfa/verify/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when MFA not enabled for user', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: false,
      mfaSecret: null,
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/verify/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('MFA is not enabled');
  });

  it('returns 400 for invalid TOTP code', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: true,
      mfaSecret: encryptSecret(generateTOTPSecret()),
      mfaBackupCodes: [],
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/verify/route');
    const res = await POST(makeRequest({ code: '000000' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid backup code', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: true,
      mfaSecret: encryptSecret(generateTOTPSecret()),
      mfaBackupCodes: [hashBackupCode('AABBCCDDEE')],
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/verify/route');
    const res = await POST(makeRequest({ code: "AABBCCDDFF" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid backup code');
  });

  it('returns 400 for code that is too short', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/auth/mfa/verify/route');
    const res = await POST(makeRequest({ code: '123' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing body', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/auth/mfa/verify/route');
    const res = await POST(new Request('http://localhost', { method: 'POST', body: 'invalid json{' }));
    expect(res.status).toBe(400);
  });
});

// ── /api/auth/mfa/disable ─────────────────────────────────────────────────────
describe('POST /api/auth/mfa/disable', () => {
  let mockDb: ReturnType<typeof getDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = getDb();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { POST } = await import('@/app/api/auth/mfa/disable/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when MFA not enabled', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: false,
      mfaSecret: null,
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/disable/route');
    const res = await POST(makeRequest({ code: '123456' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('MFA is not enabled');
  });

  it('returns 400 for invalid TOTP code when MFA is enabled', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: MOCK_USER_ID,
      mfaEnabled: true,
      mfaSecret: encryptSecret(generateTOTPSecret()),
      mfaBackupCodes: [],
    } as never);
    const { POST } = await import('@/app/api/auth/mfa/disable/route');
    const res = await POST(makeRequest({ code: '000000' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for code too short', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    const { POST } = await import('@/app/api/auth/mfa/disable/route');
    const res = await POST(makeRequest({ code: '12' }));
    expect(res.status).toBe(400);
  });
});

// ── /api/user/mfa-status ──────────────────────────────────────────────────────
describe('GET /api/user/mfa-status', () => {
  let mockDb: ReturnType<typeof getDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = getDb();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { GET } = await import('@/app/api/user/mfa-status/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns mfaEnabled: false for user without MFA', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({ mfaEnabled: false } as never);
    const { GET } = await import('@/app/api/user/mfa-status/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mfaEnabled).toBe(false);
  });

  it('returns mfaEnabled: true for user with MFA', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({ mfaEnabled: true } as never);
    const { GET } = await import('@/app/api/user/mfa-status/route');
    const res = await GET();
    const body = await res.json();
    expect(body.mfaEnabled).toBe(true);
  });

  it('returns 404 when user not found in DB', async () => {
    vi.mocked(auth).mockResolvedValue(MOCK_SESSION as never);
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue(undefined);
    const { GET } = await import('@/app/api/user/mfa-status/route');
    const res = await GET();
    expect(res.status).toBe(404);
  });
});
