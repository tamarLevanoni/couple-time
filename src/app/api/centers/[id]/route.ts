import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const center = await prisma.center.findUnique({
      where: { id },
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        superCoordinator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        gameInstances: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                targetAudience: true,
                imageUrl: true
              }
            },
            rentals: {
              where: { status: 'ACTIVE' },
              select: {
                id: true,
                expectedReturnDate: true,
                user: {
                  select: { name: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            gameInstances: true
          }
        }
      }
    });

    if (!center) {
      return errorResponse('NOT_FOUND', 'המוקד לא נמצא');
    }

    if (!center.isActive) {
      return errorResponse('NOT_FOUND', 'המוקד לא פעיל');
    }

    // Transform game instances with availability
    const gamesWithAvailability = center.gameInstances.map(instance => ({
      instanceId: instance.id,
      gameId: instance.game.id,
      game: instance.game,
      status: instance.status,
      expectedReturnDate: instance.expectedReturnDate,
      currentRental: instance.rentals[0] || null
    }));

    // Group by game to show availability counts
    const gameAvailability = gamesWithAvailability.reduce((acc, instance) => {
      const gameId = instance.game.id;
      if (!acc[gameId]) {
        acc[gameId] = {
          game: instance.game,
          instances: [],
          availableCount: 0,
          totalCount: 0
        };
      }
      acc[gameId].instances.push(instance);
      acc[gameId].totalCount++;
      if (instance.status === 'AVAILABLE') {
        acc[gameId].availableCount++;
      }
      return acc;
    }, {} as any);

    // Calculate active rentals count for this center
    const activeRentalsCount = await prisma.rental.count({
      where: {
        status: 'ACTIVE',
        gameInstance: {
          centerId: id
        }
      }
    });

    const centerWithDetails = {
      id: center.id,
      name: center.name,
      city: center.city,
      area: center.area,
      location: center.location,
      coordinator: center.coordinator,
      superCoordinator: center.superCoordinator,
      games: Object.values(gameAvailability),
      stats: {
        totalGames: center._count.gameInstances,
        activeRentals: activeRentalsCount,
        availableGames: gamesWithAvailability.filter(g => g.status === 'AVAILABLE').length
      },
      isActive: center.isActive,
      createdAt: center.createdAt,
      updatedAt: center.updatedAt
    };

    return successResponse(centerWithDetails);

  } catch (error) {
    console.error('Error fetching center:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המוקד');
  }
}