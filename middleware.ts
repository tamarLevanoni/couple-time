import { NextRequest, NextResponse } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { Role } from '@prisma/client';

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle preflight CORS requests for all API routes
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Allow public and auth routes without restriction
  if (pathname.startsWith('/api/public') || pathname.startsWith('/api/auth')) {
    const response = NextResponse.next();
    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Check if this is a protected API route
  const protectedRoutes = [
    { path: '/api/admin', requiredRole: Role.ADMIN },
    { path: '/api/coordinator', requiredRole: Role.CENTER_COORDINATOR },
    { path: '/api/super', requiredRole: Role.SUPER_COORDINATOR },
    { path: '/api/user', requiredRole: Role.USER },
  ];

  const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));
  
  if (!matchedRoute) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({ req }) as JWT | null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401, headers: corsHeaders }
      );
    }

    const userRoles = token.roles || [];
    const requiredRole = matchedRoute.requiredRole;

    // Check if user has the required role
    // ADMIN can access everything
    // SUPER_COORDINATOR can access coordinator routes
    // Others must match exactly
    const hasAccess = 
      userRoles.includes(Role.ADMIN) ||
      userRoles.includes(requiredRole) ||
      (requiredRole === Role.CENTER_COORDINATOR && userRoles.includes(Role.SUPER_COORDINATOR));

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions' } },
        { status: 403, headers: corsHeaders }
      );
    }

    const response = NextResponse.next();
    // Add CORS headers to protected route responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Authentication failed' } },
      { status: 401, headers: corsHeaders }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*', // Handle all API routes for CORS
  ],
};