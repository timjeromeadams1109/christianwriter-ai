/**
 * POST /api/auth/mfa/verify
 * Called from /auth/mfa-verify after initial sign-in.
 * Accepts a 6-digit TOTP code or a 10-character backup code.
 * On success, sets an httpOnly cookie that middleware reads to grant full access.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { auth } from '@/lib/auth';
import { decryptSecret, verifyTOTP, findBackupCodeIndex } from '@/lib/mfa';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { mfaRatelimit, checkRateLimit } from '@/lib/ratelimit';

const VerifySchema = z.object({
  code: z
    .string()
    .min(6)
    .max(10)
    .regex(/^[0-9A-F]+$/i, 'Code must be alphanumeric'),
});

export function signMfaToken(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.MFA_ENCRYPTION_KEY;
  if (!secret) throw new Error('NEXTAUTH_SECRET or MFA_ENCRYPTION_KEY is required');
  const payload = `${userId}:${Math.floor(Date.now() / 1000 / 300)}`; // 5-minute bucket
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const rateLimitResponse = await checkRateLimit(mfaRatelimit, `mfa:verify:${userId}`);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await request.json().catch(() => null);
  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.mfaEnabled || !user.mfaSecret) {
    return NextResponse.json({ error: 'MFA is not enabled' }, { status: 400 });
  }

  let plainSecret: string;
  try {
    plainSecret = decryptSecret(user.mfaSecret);
  } catch {
    console.error('[POST /api/auth/mfa/verify] Decrypt failure for user:', userId);
    return NextResponse.json({ error: 'MFA configuration error. Contact support.' }, { status: 500 });
  }

  const code = parsed.data.code.trim();
  const isTotp = /^\d{6}$/.test(code);

  if (isTotp) {
    if (!verifyTOTP(plainSecret, code)) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }
  } else {
    // Backup code path
    const storedHashes: string[] = (user.mfaBackupCodes as string[]) ?? [];
    const matchIndex = findBackupCodeIndex(code, storedHashes);
    if (matchIndex === -1) {
      return NextResponse.json({ error: 'Invalid backup code.' }, { status: 400 });
    }
    // Consume the backup code — single use only
    const updatedHashes = storedHashes.filter((_, i) => i !== matchIndex);
    await db.update(users).set({ mfaBackupCodes: updatedHashes }).where(eq(users.id, userId));
  }

  const cookieStore = await cookies();
  cookieStore.set('mfa_verified', signMfaToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours — matches session maxAge
  });

  return NextResponse.json({ success: true });
}
