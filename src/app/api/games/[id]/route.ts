import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireCoordinator } from '@/lib/api-auth';
import { updateGameSchema } from '@/lib/validations';
import { GameInstanceStatus } from '@prisma/client';

// GET /api/games/[id] - Get single game
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: {
      gameInstances: {
        include: {
          center: {
            select: {
              id: true,
              name: true,
              city: true,
              area: true,
            }
          },
          rentals: {
            where: {
              status: 'ACTIVE'
            },
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
        }
      }
    }
  });
  
  if (!game) {
    return ApiResponseHelper.notFound('משחק לא נמצא');
  }
  
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

// PUT /api/games/[id] - Update game
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireCoordinator(request);
  
  const body = await request.json();
  const data = updateGameSchema.parse(body);
  
  const game = await prisma.game.update({
    where: { id: params.id },
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

// DELETE /api/games/[id] - Delete game
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireCoordinator(request);
  
  // Check if game has any active rentals
  const activeRentals = await prisma.rental.count({
    where: {
      gameInstance: {
        gameId: params.id
      },
      status: 'ACTIVE'
    }
  });
  
  if (activeRentals > 0) {
    return ApiResponseHelper.error(
      'לא ניתן למחוק משחק עם השאלות פעילות',
      400,
      'GAME_HAS_ACTIVE_RENTALS'
    );
  }
  
  await prisma.game.delete({
    where: { id: params.id }
  });
  
  return ApiResponseHelper.success({ message: 'משחק נמחק בהצלחה' });
});