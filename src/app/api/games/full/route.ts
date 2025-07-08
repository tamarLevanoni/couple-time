import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get all games with full details including center availability
    const games = await prisma.game.findMany({
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

    // Transform to include both basic game info and detailed info
    const gamesWithDetails = games.map(game => {
      // Basic game info for lists
      const basicGame = {
        id: game.id,
        name: game.name,
        description: game.description,
        category: game.category,
        targetAudience: game.targetAudience,
        imageUrl: game.imageUrl,
        availableCount: game.gameInstances.filter(gi => gi.status === 'AVAILABLE').length,
        totalInstances: game._count.gameInstances,
        availableCenters: [...new Set(game.gameInstances.map(gi => gi.centerId))].length
      };

      // Detailed info for individual game pages
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

      const gameDetails = {
        ...basicGame,
        centerAvailability: Object.values(centerAvailability),
        createdAt: game.createdAt,
        updatedAt: game.updatedAt
      };

      return {
        basic: basicGame,
        details: gameDetails
      };
    });

    return successResponse(gamesWithDetails);

  } catch (error) {
    console.error('Error fetching full games data:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המשחקים');
  }
}