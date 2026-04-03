import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { handlers } from '@/lib/auth';
import { loginRatelimit, checkRateLimit } from '@/lib/ratelimit';

export const { GET } = handlers;

// Wrap POST to rate-limit credentials sign-in attempts before delegating to NextAuth.
// NextAuth v5 beta routes credentials sign-in through POST /api/auth/signin/credentials.
// All other POST paths (CSRF, session, signout, OAuth callbacks) are passed through unchanged.
export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname.endsWith('/signin/credentials')) {
    const headersList = await headers();
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown';

    const rateLimitResponse = await checkRateLimit(loginRatelimit, ip);
    if (rateLimitResponse) return rateLimitResponse;
  }

  return handlers.POST(req);
}
