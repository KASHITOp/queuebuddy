import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require auth checks
  const isPublicPath =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/buddy/login' ||
    pathname === '/buddy/apply' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check auth cookie / token
  const authSession = request.cookies.get('sb-access-token') || request.cookies.get('qb_session');

  // In demo / client mode, let client-side router handle redirect with rich UI
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
