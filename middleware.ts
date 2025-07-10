import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public and auth routes without restriction
  if (pathname.startsWith('/api/public') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check if this is a protected API route
  const protectedRoutes = [
    { path: '/api/admin', requiredRole: 'ADMIN' },
    { path: '/api/coordinator', requiredRole: 'CENTER_COORDINATOR' },
    { path: '/api/super', requiredRole: 'SUPER_COORDINATOR' },
    { path: '/api/user', requiredRole: 'USER' },
  ];

  const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));
  
  if (!matchedRoute) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({ req }) as AuthToken | null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userRoles = token.roles || [];
    const requiredRole = matchedRoute.requiredRole;

    // Check if user has the required role
    // ADMIN can access everything
    // SUPER_COORDINATOR can access coordinator routes
    // Others must match exactly
    const hasAccess = 
      userRoles.includes('ADMIN') ||
      userRoles.includes(requiredRole) ||
      (requiredRole === 'CENTER_COORDINATOR' && userRoles.includes('SUPER_COORDINATOR'));

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Authentication failed' } },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/coordinator/:path*',
    '/api/super/:path*',
    '/api/user/:path*',
  ],
};