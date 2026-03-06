/**
 * Next.js middleware — auth guard.
 *
 * Protects all routes except the auth pages (/auth/*).
 * Reads the auth token from localStorage via a cookie fallback strategy:
 * since middleware runs on the Edge (no localStorage access), we use a
 * lightweight cookie named "auth_token" that is kept in sync by the client.
 *
 * Flow:
 *   - Unauthenticated user hits /notes → redirect to /auth/login
 *   - Authenticated user hits /auth/*  → redirect to /notes
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];
const AUTH_COOKIE = 'auth_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthenticated = Boolean(token);

  // Authenticated user trying to access auth pages → send to notes
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  // Unauthenticated user trying to access protected pages → send to login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all paths except:
   *   - Next.js internals (_next/static, _next/image, favicon.ico)
   *   - API routes that handle their own auth
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
