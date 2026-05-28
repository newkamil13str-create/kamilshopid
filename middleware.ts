import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];
const PROTECTED_ROUTES = ['/checkout', '/order', '/payment'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;
  const roleCookie = request.cookies.get('role')?.value;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login?redirect=/admin/dashboard', request.url));
    }
    if (roleCookie !== 'admin') {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
  }

  // Protect user routes
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/checkout/:path*',
    '/order/:path*',
    '/payment/:path*',
  ],
};
