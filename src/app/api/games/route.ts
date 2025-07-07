import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireCoordinator, getPaginationParams } from '@/lib/api-auth';
import { createGameSchema, gameQuerySchema, parseCommaSeparatedEnum } from '@/lib/validations';
import { GameCategory, TargetAudience, GameInstanceStatus } from '@prisma/client';

// GET /api/games - List games with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const query = gameQuerySchema.parse(Object.fromEntries(searchParams));
  
  const { page, limit, skip } = getPaginationParams(request);
  
  // Build where clause
  const where: any = {};
  
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  
  if (query.categories) {
    const categories = parseCommaSeparatedEnum(query.categories, GameCategory);
    if (categories) {
      where.categories = { hasSome: categories };
    }
  }
  
  if (query.targetAudiences) {
    const audiences = parseCommaSeparatedEnum(query.targetAudiences, TargetAudience);
    if (audiences) {
      where.targetAudiences = { hasSome: audiences };
    }
  }
  
  // Center filter
  if (query.centerId) {
    where.gameInstances = {
      some: { centerId: query.centerId }
    };
  }
  
  // Availability filter
  if (query.availability !== 'all') {
    const statusFilter = query.availability === 'available' 
      ? GameInstanceStatus.AVAILABLE
      : query.availability === 'borrowed'
      ? GameInstanceStatus.BORROWED
      : GameInstanceStatus.UNAVAILABLE;
      
    where.gameInstances = {
      some: { status: statusFilter }
    };
  }
  
  // Build orderBy
  const orderBy: any = {};
  if (query.sortBy === 'availableCount') {
    // This requires a more complex query, we'll handle it differently
    orderBy.name = query.sortOrder;
  } else {
    orderBy[query.sortBy] = query.sortOrder;
  }
  
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      include: {
        gameInstances: {
          include: {
            center: {
              select: {
                id: true,
                name: true,
                city: true,
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.game.count({ where }),
  ]);
  
  // Transform data to include availability counts
  const gamesWithStats = games.map(game => ({
    ...game,
    instances: game.gameInstances,
    availableCount: game.gameInstances.filter(instance => 
      instance.status === GameInstanceStatus.AVAILABLE
    ).length,
    totalCount: game.gameInstances.length,
  }));
  
  return ApiResponseHelper.success(gamesWithStats, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// POST /api/games - Create new game
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireCoordinator(request);
  
  const body = await request.json();
  const data = createGameSchema.parse(body);
  
  const game = await prisma.game.create({
    data,
    include: {
      gameInstances: {
        include: {
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
  
  const gameWithStats = {
    ...game,
    instances: game.gameInstances,
    availableCount: game.gameInstances.filter(instance => 
      instance.status === GameInstanceStatus.AVAILABLE
    ).length,
    totalCount: game.gameInstances.length,
  };
  
  return ApiResponseHelper.success(gameWithStats);
});