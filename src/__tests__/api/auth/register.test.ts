/**
 * Tests for POST /api/auth/register
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { getDb } from '@/lib/db';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  let mockDb: ReturnType<typeof getDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = getDb();
    // Reset db mock state
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue(undefined);
    vi.mocked(mockDb.insert({}as never).values({} as never).returning).mockResolvedValue([
      { id: 'user-uuid-123', email: 'new@example.com', name: 'New User' },
    ]);
  });

  it('returns 200 with user data on successful registration', async () => {
    const res = await POST(makeRequest({ email: 'new@example.com', password: 'password123' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).not.toHaveProperty('hashedPassword');
  });

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'password123' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request');
  });

  it('returns 400 for missing password', async () => {
    const res = await POST(makeRequest({ email: 'user@example.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when user already exists', async () => {
    vi.mocked(mockDb.query.users.findFirst).mockResolvedValue({
      id: 'existing-id',
      email: 'existing@example.com',
    } as never);
    const res = await POST(makeRequest({ email: 'existing@example.com', password: 'pass' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('already exists');
  });

  it('returns 400 for empty request body fields', async () => {
    const res = await POST(makeRequest({ email: '', password: '' }));
    expect(res.status).toBe(400);
  });

  it('never returns hashedPassword in response', async () => {
    const res = await POST(makeRequest({ email: 'safe@example.com', password: 'secret' }));
    const body = await res.json();
    expect(body).not.toHaveProperty('hashedPassword');
    expect(body).not.toHaveProperty('password');
  });
});
