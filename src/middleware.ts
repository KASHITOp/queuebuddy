import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets & internal next routes MUST always pass through immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next();
  }

  // Public pages that do not require auth checks
  const isPublicPath =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/buddy/login' ||
    pathname === '/buddy/apply' ||
    pathname.startsWith('/api/');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Add standard security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
