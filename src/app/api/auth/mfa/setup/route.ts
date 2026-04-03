/**
 * POST /api/auth/mfa/setup
 * Generates a new TOTP secret and returns the otpauth:// URI for QR display.
 * Does NOT yet enable MFA — the user must verify the code via /mfa/verify-setup.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateTOTPSecret, generateTOTPUri, encryptSecret } from '@/lib/mfa';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const secret = generateTOTPSecret();
  const uri = generateTOTPUri(secret, session.user.email ?? userId);
  const encryptedSecret = encryptSecret(secret);

  const db = getDb();
  await db.update(users).set({ mfaSecret: encryptedSecret }).where(eq(users.id, userId));

  return NextResponse.json({ uri, secret });
}
