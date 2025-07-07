import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/error',
      '/auth/verify-request',
      '/games',
      '/centers',
      '/api/auth'
    ];

    // Check if route is public
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Protected routes that require authentication
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    const userRoles = token.roles as Role[];

    // Admin routes
    if (pathname.startsWith('/admin')) {
      if (!userRoles.includes(Role.ADMIN)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Super coordinator routes
    if (pathname.startsWith('/super')) {
      if (!userRoles.includes(Role.SUPER_COORDINATOR) && !userRoles.includes(Role.ADMIN)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Coordinator routes
    if (pathname.startsWith('/coordinator')) {
      if (!userRoles.includes(Role.CENTER_COORDINATOR) && 
          !userRoles.includes(Role.SUPER_COORDINATOR) && 
          !userRoles.includes(Role.ADMIN)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // User dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // All authenticated users can access user dashboard
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};