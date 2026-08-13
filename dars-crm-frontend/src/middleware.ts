import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('dars_auth_token')?.value;
  const rawRole = request.cookies.get('user_role')?.value;
  const role = rawRole?.toUpperCase();

  const path = request.nextUrl.pathname;

  // 1. Redirect unauthenticated users to login
  if (!token && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Prevent logged-in users from accessing the login page
  if (token && path === '/login') {
    if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin', request.url));
    if (role === 'NAZIM' || role === 'CENTER_ADMIN') return NextResponse.redirect(new URL('/nazim', request.url));
    if (role === 'USTAD') return NextResponse.redirect(new URL('/ustad', request.url));
    return NextResponse.redirect(new URL('/nazim', request.url));
  }

  // 3. SUPER_ADMIN has full global access to all dashboards
  if (role === 'SUPER_ADMIN') {
    return NextResponse.next();
  }

  // 4. Enforce Role-Based Access Control (RBAC)
  if (path.startsWith('/super-admin') && role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (path.startsWith('/nazim') && role !== 'NAZIM' && role !== 'CENTER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (path.startsWith('/ustad') && role !== 'USTAD' && role !== 'NAZIM' && role !== 'CENTER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    '/super-admin/:path*',
    '/nazim/:path*',
    '/ustad/:path*',
    '/login',
  ],
};
