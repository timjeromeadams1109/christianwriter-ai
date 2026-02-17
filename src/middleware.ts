import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    const session = await auth();

    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
