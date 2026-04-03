/**
 * POST /api/auth/mfa/verify-setup
 * Confirms the user's authenticator app is working. On success: mfaEnabled = true,
 * fresh backup codes are issued and returned once.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { decryptSecret, verifyTOTP, generateBackupCodes } from '@/lib/mfa';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { mfaRatelimit, checkRateLimit } from '@/lib/ratelimit';

const VerifySetupSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const rateLimitResponse = await checkRateLimit(mfaRatelimit, `mfa:setup:${userId}`);
  if (rateLimitResponse) return rateLimitResponse;

  const body = await request.json().catch(() => null);
  const parsed = VerifySetupSchema.safeParse(body);
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

  if (user.mfaEnabled) {
    return NextResponse.json({ error: 'MFA is already enabled' }, { status: 409 });
  }

  if (!user.mfaSecret) {
    return NextResponse.json({ error: 'No pending MFA setup found. Call /setup first.' }, { status: 400 });
  }

  let plainSecret: string;
  try {
    plainSecret = decryptSecret(user.mfaSecret);
  } catch {
    console.error('[POST /api/auth/mfa/verify-setup] Decrypt failure for user:', userId);
    return NextResponse.json({ error: 'MFA setup data is corrupted. Please restart setup.' }, { status: 500 });
  }

  if (!verifyTOTP(plainSecret, parsed.data.code)) {
    return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
  }

  const { plaintext, hashed } = generateBackupCodes();

  await db
    .update(users)
    .set({ mfaEnabled: true, mfaBackupCodes: hashed })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true, backupCodes: plaintext });
}
