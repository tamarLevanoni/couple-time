import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireCoordinator, getPaginationParams } from '@/lib/api-auth';
import { createGameInstanceSchema } from '@/lib/validations';

// GET /api/game-instances - List game instances
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireCoordinator(request);
  
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = getPaginationParams(request);
  
  const centerId = searchParams.get('centerId');
  const gameId = searchParams.get('gameId');
  const status = searchParams.get('status');
  
  const where: any = {};
  
  if (centerId) where.centerId = centerId;
  if (gameId) where.gameId = gameId;
  if (status) where.status = status;
  
  const [instances, total] = await Promise.all([
    prisma.gameInstance.findMany({
      where,
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
          }
        },
        rentals: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.gameInstance.count({ where }),
  ]);
  
  return ApiResponseHelper.success(instances, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// POST /api/game-instances - Create new game instance
export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireCoordinator(request);
  
  const body = await request.json();
  const data = createGameInstanceSchema.parse(body);
  
  // Check if game exists
  const game = await prisma.game.findUnique({
    where: { id: data.gameId }
  });
  
  if (!game) {
    return ApiResponseHelper.notFound('משחק לא נמצא');
  }
  
  // Check if center exists
  const center = await prisma.center.findUnique({
    where: { id: data.centerId }
  });
  
  if (!center) {
    return ApiResponseHelper.notFound('מוקד לא נמצא');
  }
  
  const instance = await prisma.gameInstance.create({
    data,
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
  });
  
  return ApiResponseHelper.success(instance);
});