import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MFA_VERIFY_PATH = '/auth/mfa-verify';

// Web Crypto HMAC — Edge-compatible (no Node crypto import)
async function verifyMfaCookie(cookie: string | undefined, userId: string): Promise<boolean> {
  if (!cookie || !userId) return false;
  try {
    const secretStr = process.env.NEXTAUTH_SECRET ?? process.env.MFA_ENCRYPTION_KEY;
    if (!secretStr) throw new Error('NEXTAUTH_SECRET or MFA_ENCRYPTION_KEY is required');
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const bucket = Math.floor(Date.now() / 1000 / 300);
    for (const b of [bucket, bucket - 1]) {
      const payload = enc.encode(`${userId}:${b}`);
      const sig = await crypto.subtle.sign('HMAC', key, payload);
      const hex = Array.from(new Uint8Array(sig))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      if (hex === cookie) return true;
    }
  } catch {
    // Fail open — crypto error should not lock users out
  }
  return false;
}

export default async function middleware(request: NextRequest) {
  // Skip auth checks if DATABASE_URL is not configured (development mode)
  if (!process.env.DATABASE_URL) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Dynamically import auth only when database is configured
  const { auth } = await import('@/lib/auth');

  // Check if the path is protected (dashboard routes)
  if (pathname.startsWith('/dashboard')) {
    const session = await auth();

    if (!session) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // MFA gate — session exists but MFA challenge not yet passed
    if (session.user?.mfaPending) {
      const mfaCookie = request.cookies.get('mfa_verified')?.value;
      const verified = await verifyMfaCookie(mfaCookie, session.user.id ?? '');
      if (!verified) {
        return NextResponse.redirect(new URL(MFA_VERIFY_PATH, request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    const session = await auth();

    if (session) {
      // If MFA is still pending, send to MFA verify page instead of dashboard
      if (session.user?.mfaPending) {
        const mfaCookie = request.cookies.get('mfa_verified')?.value;
        const verified = await verifyMfaCookie(mfaCookie, session.user.id ?? '');
        if (!verified) {
          return NextResponse.redirect(new URL(MFA_VERIFY_PATH, request.url));
        }
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
