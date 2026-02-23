import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // 1. If trying to access protected routes without a session, redirect to login
  if (!session && (pathname.startsWith('/admin') || pathname.startsWith('/instructor'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If already logged in and trying to access login page, redirect to dashboard
  if (session && pathname === '/login') {
    // We don't know the role here easily without a DB check, 
    // but we can let the login page or a secondary check handle the specific redirect.
    // For now, let's just let it be or redirect to a default.
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/instructor/:path*', '/login'],
};
