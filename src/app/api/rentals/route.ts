import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireCoordinator, getPaginationParams } from '@/lib/api-auth';
import { createRentalSchema, rentalQuerySchema, parseCommaSeparatedEnum } from '@/lib/validations';
import { RentalStatus, GameInstanceStatus } from '@prisma/client';

// GET /api/rentals - List rentals with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireAuth(request);
  
  const { searchParams } = new URL(request.url);
  const query = rentalQuerySchema.parse(Object.fromEntries(searchParams));
  
  const { page, limit, skip } = getPaginationParams(request);
  
  // Build where clause
  const where: any = {};
  
  // Role-based filtering
  if (!user.roles.includes('ADMIN') && !user.roles.includes('SUPER_COORDINATOR')) {
    if (user.roles.includes('CENTER_COORDINATOR')) {
      // Coordinators can only see rentals from their centers
      where.gameInstance = {
        center: {
          coordinatorId: user.id
        }
      };
    } else {
      // Regular users can only see their own rentals
      where.userId = user.id;
    }
  }
  
  // Search filter
  if (query.search) {
    where.OR = [
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
      { gameInstance: { game: { name: { contains: query.search, mode: 'insensitive' } } } },
      { notes: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  
  // Status filter
  if (query.status) {
    const statuses = parseCommaSeparatedEnum(query.status, RentalStatus);
    if (statuses) {
      where.status = { in: statuses };
    }
  }
  
  // Center filter
  if (query.centerId) {
    where.gameInstance = {
      ...where.gameInstance,
      centerId: query.centerId
    };
  }
  
  // Game filter
  if (query.gameId) {
    where.gameInstance = {
      ...where.gameInstance,
      gameId: query.gameId
    };
  }
  
  // User filter (for admins/coordinators)
  if (query.userId && (user.roles.includes('ADMIN') || user.roles.includes('SUPER_COORDINATOR') || user.roles.includes('CENTER_COORDINATOR'))) {
    where.userId = query.userId;
  }
  
  // Date range filter
  if (query.fromDate || query.toDate) {
    where.requestDate = {};
    if (query.fromDate) {
      where.requestDate.gte = new Date(query.fromDate);
    }
    if (query.toDate) {
      where.requestDate.lte = new Date(query.toDate);
    }
  }
  
  // Build orderBy
  const orderBy: any = {};
  orderBy[query.sortBy] = query.sortOrder;
  
  const [rentals, total] = await Promise.all([
    prisma.rental.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        gameInstance: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                categories: true,
                targetAudiences: true,
              }
            },
            center: {
              select: {
                id: true,
                name: true,
                city: true,
                area: true,
              }
            }
          }
        },
        actions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            changedAt: 'desc'
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.rental.count({ where }),
  ]);
  
  return ApiResponseHelper.success(rentals, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// POST /api/rentals - Create new rental request
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireAuth(request);
  
  const body = await request.json();
  const data = createRentalSchema.parse(body);
  
  // Check if game instance exists and is available
  const gameInstance = await prisma.gameInstance.findUnique({
    where: { id: data.gameInstanceId },
    include: {
      game: true,
      center: true,
    }
  });
  
  if (!gameInstance) {
    return ApiResponseHelper.notFound('משחק לא נמצא');
  }
  
  if (gameInstance.status !== GameInstanceStatus.AVAILABLE) {
    return ApiResponseHelper.error(
      'משחק לא זמין להשאלה כרגע',
      400,
      'GAME_NOT_AVAILABLE'
    );
  }
  
  // Check if user already has an active rental for this game
  const existingRental = await prisma.rental.findFirst({
    where: {
      userId: user.id,
      gameInstance: {
        gameId: gameInstance.gameId
      },
      status: {
        in: [RentalStatus.PENDING, RentalStatus.ACTIVE]
      }
    }
  });
  
  if (existingRental) {
    return ApiResponseHelper.conflict('יש לך כבר השאלה פעילה או ממתינה למשחק זה');
  }
  
  // Create the rental
  const rental = await prisma.rental.create({
    data: {
      userId: user.id,
      gameInstanceId: data.gameInstanceId,
      status: RentalStatus.PENDING,
      expectedReturnDate: data.expectedReturnDate,
      notes: data.notes,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      gameInstance: {
        include: {
          game: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
            }
          },
          center: {
            select: {
              id: true,
              name: true,
              city: true,
            }
          }
        }
      }
    }
  });
  
  // Create action log
  await prisma.action.create({
    data: {
      rentalId: rental.id,
      userId: user.id,
      previousStatus: null,
      newStatus: RentalStatus.PENDING,
      changeReason: 'בקשת השאלה חדשה',
    }
  });
  
  // TODO: Send notification to coordinator
  
  return ApiResponseHelper.success(rental);
});