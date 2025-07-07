import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireAdmin, getPaginationParams } from '@/lib/api-auth';
import { userQuerySchema, parseCommaSeparatedEnum } from '@/lib/validations';
import { Role } from '@prisma/client';

// GET /api/users - List users with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const currentUser = await requireAuth(request);
  
  const { searchParams } = new URL(request.url);
  const query = userQuerySchema.parse(Object.fromEntries(searchParams));
  
  const { page, limit, skip } = getPaginationParams(request);
  
  // Build where clause
  const where: any = {};
  
  // Role-based filtering
  if (!currentUser.roles.includes('ADMIN')) {
    if (currentUser.roles.includes('SUPER_COORDINATOR')) {
      // Super coordinators can see users from their supervised centers
      where.OR = [
        { roles: { has: Role.USER } },
        { roles: { has: Role.CENTER_COORDINATOR } },
        { 
          managedCenterIds: {
            hasSome: currentUser.supervisedCenterIds || []
          }
        }
      ];
    } else if (currentUser.roles.includes('CENTER_COORDINATOR')) {
      // Center coordinators can see users from their centers only
      where.OR = [
        { id: currentUser.id }, // Can see themselves
        { 
          rentals: {
            some: {
              gameInstance: {
                center: {
                  coordinatorId: currentUser.id
                }
              }
            }
          }
        }
      ];
    } else {
      // Regular users can only see themselves
      where.id = currentUser.id;
    }
  }
  
  // Search filter
  if (query.search) {
    where.OR = [
      ...(where.OR || []),
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  
  // Role filter
  if (query.roles) {
    const roles = parseCommaSeparatedEnum(query.roles, Role);
    if (roles) {
      where.roles = { hasSome: roles };
    }
  }
  
  // Active status filter
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }
  
  // Center filter
  if (query.centerId) {
    where.OR = [
      ...(where.OR || []),
      { managedCenterIds: { has: query.centerId } },
      { supervisedCenterIds: { has: query.centerId } },
    ];
  }
  
  // Build orderBy
  const orderBy: any = {};
  orderBy[query.sortBy] = query.sortOrder;
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        managedCenterIds: true,
        supervisedCenterIds: true,
        defaultDashboard: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        // Include related data
        managedCenters: {
          select: {
            id: true,
            name: true,
            city: true,
          }
        },
        supervisedCenters: {
          select: {
            id: true,
            name: true,
            city: true,
          }
        },
        _count: {
          select: {
            rentals: true,
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  
  return ApiResponseHelper.success(users, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});