import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { updateGameSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        gameInstances: {
          include: {
            center: {
              select: {
                id: true,
                name: true,
                city: true,
                area: true,
                coordinator: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { gameInstances: true }
        }
      }
    });

    if (!game) {
      return errorResponse('NOT_FOUND', 'המשחק לא נמצא');
    }

    // Group instances by center and status
    const centerAvailability = game.gameInstances.reduce((acc, instance) => {
      const centerId = instance.center.id;
      if (!acc[centerId]) {
        acc[centerId] = {
          center: instance.center,
          available: 0,
          total: 0,
          instances: []
        };
      }
      acc[centerId].total++;
      if (instance.status === 'AVAILABLE') {
        acc[centerId].available++;
      }
      acc[centerId].instances.push({
        id: instance.id,
        status: instance.status,
        expectedReturnDate: instance.expectedReturnDate
      });
      return acc;
    }, {} as any);

    const gameWithAvailability = {
      id: game.id,
      name: game.name,
      description: game.description,
      category: game.category,
      targetAudience: game.targetAudience,
      imageUrl: game.imageUrl,
      totalInstances: game._count.gameInstances,
      availableInstances: game.gameInstances.filter(gi => gi.status === 'AVAILABLE').length,
      centerAvailability: Object.values(centerAvailability),
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    };

    return successResponse(gameWithAvailability);

  } catch (error) {
    console.error('Error fetching game:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המשחק');
  }
}

export const PUT = withAuth(async (request: NextRequest, { user, params }: { user: any; params: Promise<{ id: string }> }) => {
  try {
    // Check permissions
    if (!user.roles.includes('CENTER_COORDINATOR') && 
        !user.roles.includes('SUPER_COORDINATOR') && 
        !user.roles.includes('ADMIN')) {
      return errorResponse('FORBIDDEN', 'אין הרשאה לערוך משחק');
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateGameSchema.parse(body);

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id }
    });

    if (!existingGame) {
      return errorResponse('NOT_FOUND', 'המשחק לא נמצא');
    }

    // For coordinators, check if they can edit this game
    if (user.roles.includes('CENTER_COORDINATOR') && !user.roles.includes('ADMIN')) {
      // Coordinators can only edit games they created or games in their centers
      const canEdit = existingGame.createdBy === user.id || 
        await prisma.gameInstance.findFirst({
          where: {
            gameId: id,
            centerId: { in: user.managedCenterIds }
          }
        });

      if (!canEdit) {
        return errorResponse('FORBIDDEN', 'אין הרשאה לערוך משחק זה');
      }
    }

    const updatedGame = await prisma.game.update({
      where: { id },
      data: validatedData
    });

    return successResponse(updatedGame);

  } catch (error) {
    console.error('Error updating game:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('VALIDATION_ERROR', 'נתונים לא תקינים');
    }
    return errorResponse('INTERNAL_ERROR', 'שגיאה בעדכון המשחק');
  }
});

export const DELETE = withAuth(async (request: NextRequest, { user, params }: { user: any; params: Promise<{ id: string }> }) => {
  try {
    // Only admins can delete games
    if (!user.roles.includes('ADMIN')) {
      return errorResponse('FORBIDDEN', 'אין הרשאה למחוק משחק');
    }

    const { id } = await params;
    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id },
      include: {
        gameInstances: {
          include: {
            rentals: {
              where: {
                status: { in: ['PENDING', 'ACTIVE'] }
              }
            }
          }
        }
      }
    });

    if (!existingGame) {
      return errorResponse('NOT_FOUND', 'המשחק לא נמצא');
    }

    // Check if there are active rentals
    const activeRentals = existingGame.gameInstances.some(gi => 
      gi.rentals.some(rental => rental.status === 'ACTIVE' || rental.status === 'PENDING')
    );

    if (activeRentals) {
      return errorResponse('VALIDATION_ERROR', 'לא ניתן למחוק משחק עם השאלות פעילות');
    }

    // Delete game and all related instances
    await prisma.game.delete({
      where: { id }
    });

    return successResponse({ message: 'המשחק נמחק בהצלחה' });

  } catch (error) {
    console.error('Error deleting game:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה במחיקת המשחק');
  }
});