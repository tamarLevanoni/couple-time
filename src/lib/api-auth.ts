import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Role } from '@prisma/client';
import { ApiResponseHelper } from './api-response';

export async function getAuthenticatedUser(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { error: ApiResponseHelper.unauthorized('נדרשת התחברות') };
  }

  return { user: session.user };
}

export async function requireAuth(request: NextRequest) {
  const result = await getAuthenticatedUser(request);
  
  if (result.error) {
    throw new Error('UNAUTHORIZED');
  }

  return result.user!;
}

export async function requireRole(request: NextRequest, roles: Role[]) {
  const user = await requireAuth(request);
  
  const hasRole = user.roles.some(role => roles.includes(role));
  
  if (!hasRole) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, [Role.ADMIN]);
}

export async function requireCoordinator(request: NextRequest) {
  return requireRole(request, [Role.CENTER_COORDINATOR, Role.SUPER_COORDINATOR, Role.ADMIN]);
}

export async function requireSuperCoordinator(request: NextRequest) {
  return requireRole(request, [Role.SUPER_COORDINATOR, Role.ADMIN]);
}

// Check if user can access center data
export async function canAccessCenter(request: NextRequest, centerId: string) {
  const user = await requireAuth(request);
  
  // Admins and super coordinators can access all centers
  if (user.roles.includes(Role.ADMIN) || user.roles.includes(Role.SUPER_COORDINATOR)) {
    return user;
  }
  
  // Center coordinators can only access their assigned centers
  if (user.roles.includes(Role.CENTER_COORDINATOR)) {
    // This would need to be checked against the user's assigned centers
    // For now, we'll allow access and implement proper checking later
    return user;
  }
  
  throw new Error('FORBIDDEN');
}

// Pagination helper
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

// Search params helper
export function getSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
  
  return { search, sortBy, sortOrder };
}