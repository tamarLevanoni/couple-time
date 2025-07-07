import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireSuperCoordinator, getPaginationParams } from '@/lib/api-auth';
import { createCenterSchema, centerQuerySchema } from '@/lib/validations';
import { Area } from '@prisma/client';

// GET /api/centers - List centers with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAuth(request);
  
  const { searchParams } = new URL(request.url);
  const query = centerQuerySchema.parse(Object.fromEntries(searchParams));
  
  const { page, limit, skip } = getPaginationParams(request);
  
  // Build where clause
  const where: any = {};
  
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  
  if (query.area) {
    where.area = query.area;
  }
  
  if (query.hasCoordinator !== undefined) {
    if (query.hasCoordinator) {
      where.coordinatorId = { not: null };
    } else {
      where.coordinatorId = null;
    }
  }
  
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }
  
  // Build orderBy
  const orderBy: any = {};
  orderBy[query.sortBy] = query.sortOrder;
  
  const [centers, total] = await Promise.all([
    prisma.center.findMany({
      where,
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        superCoordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        gameInstances: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              }
            },
            rentals: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        },
        _count: {
          select: {
            gameInstances: true,
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.center.count({ where }),
  ]);
  
  // Transform data to include stats
  const centersWithStats = centers.map(center => {
    const totalGames = center.gameInstances.length;
    const availableGames = center.gameInstances.filter(instance => 
      instance.status === 'AVAILABLE'
    ).length;
    const activeRentals = center.gameInstances.reduce((sum, instance) => 
      sum + instance.rentals.length, 0
    );
    
    // Get pending requests count (we'll need to add this query later)
    const pendingRequests = 0; // TODO: Calculate pending requests
    
    return {
      ...center,
      stats: {
        totalGames,
        availableGames,
        activeRentals,
        pendingRequests,
      }
    };
  });
  
  return ApiResponseHelper.success(centersWithStats, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// POST /api/centers - Create new center
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireSuperCoordinator(request);
  
  const body = await request.json();
  const data = createCenterSchema.parse(body);
  
  const center = await prisma.center.create({
    data,
    include: {
      coordinator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      superCoordinator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      gameInstances: {
        include: {
          game: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });
  
  const centerWithStats = {
    ...center,
    stats: {
      totalGames: 0,
      availableGames: 0,
      activeRentals: 0,
      pendingRequests: 0,
    }
  };
  
  return ApiResponseHelper.success(centerWithStats);
});