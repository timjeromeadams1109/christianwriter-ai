/**
 * POST /api/auth/mfa/disable
 * Disables MFA. Requires a valid TOTP or backup code as confirmation.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { decryptSecret, verifyTOTP, findBackupCodeIndex } from '@/lib/mfa';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { mfaRatelimit, checkRateLimit } from '@/lib/ratelimit';

const DisableSchema = z.object({
  code: z
    .string()
    .min(6)
    .max(10)
    .regex(/^[0-9A-F]+$/i, 'Code must be alphanumeric'),
});

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const rateLimitResponse = await checkRateLimit(mfaRatelimit, `mfa:disable:${userId}`);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await request.json().catch(() => null);
  const parsed = DisableSchema.safeParse(body);
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
    console.error('[POST /api/auth/mfa/disable] Decrypt failure for user:', userId);
    return NextResponse.json({ error: 'MFA configuration error. Contact support.' }, { status: 500 });
  }

  const code = parsed.data.code.trim();
  const isTotp = /^\d{6}$/.test(code);

  if (isTotp) {
    if (!verifyTOTP(plainSecret, code)) {
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }
  } else {
    const storedHashes: string[] = (user.mfaBackupCodes as string[]) ?? [];
    const matchIndex = findBackupCodeIndex(code, storedHashes);
    if (matchIndex === -1) {
      return NextResponse.json({ error: 'Invalid backup code.' }, { status: 400 });
    }
  }

  await db
    .update(users)
    .set({ mfaEnabled: false, mfaSecret: null, mfaBackupCodes: [] })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
