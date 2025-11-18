import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth status from environment
  const ENABLE_AUTH = process.env.NEXT_PUBLIC_ENABLE_AUTH === 'true';

  // If auth is disabled, allow all requests
  if (!ENABLE_AUTH) {
    return NextResponse.next();
  }

  // Check if the path is under /dashboard
  if (pathname.startsWith('/dashboard')) {
    try {
      const session = await getSession();

      // If not logged in, redirect to sign-in page
      if (!session?.isLoggedIn) {
        const signInUrl = new URL('/auth/sign-in', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error('Session error in middleware:', error);
      // If session check fails, redirect to sign-in
      const signInUrl = new URL('/auth/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
