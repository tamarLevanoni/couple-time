import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get all centers with full details
    const centers = await prisma.center.findMany({
      where: { isActive: true },
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

    // Get active rentals count for all centers efficiently
    const centerIds = centers.map(c => c.id);
    const activeRentalsData = await prisma.rental.findMany({
      where: {
        status: 'ACTIVE',
        gameInstance: {
          centerId: { in: centerIds }
        }
      },
      select: {
        gameInstance: {
          select: {
            centerId: true
          }
        }
      }
    });

    // Create a map of centerId to active rentals count
    const rentalsMap = new Map<string, number>();
    activeRentalsData.forEach(rental => {
      const centerId = rental.gameInstance.centerId;
      rentalsMap.set(centerId, (rentalsMap.get(centerId) || 0) + 1);
    });

    // Transform centers to include both basic and detailed info
    const centersWithDetails = centers.map(center => {
      // Basic center info for lists
      const basicCenter = {
        id: center.id,
        name: center.name,
        city: center.city,
        area: center.area,
        location: center.location,
        coordinator: center.coordinator,
        superCoordinator: center.superCoordinator,
        stats: {
          totalGames: center._count.gameInstances,
          activeRentals: rentalsMap.get(center.id) || 0
        },
        isActive: center.isActive,
        createdAt: center.createdAt,
        updatedAt: center.updatedAt
      };

      // Detailed info for individual center pages
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

      const centerDetails = {
        ...basicCenter,
        games: Object.values(gameAvailability),
        stats: {
          ...basicCenter.stats,
          availableGames: gamesWithAvailability.filter(g => g.status === 'AVAILABLE').length
        }
      };

      return {
        basic: basicCenter,
        details: centerDetails
      };
    });

    return successResponse(centersWithDetails);

  } catch (error) {
    console.error('Error fetching full centers data:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המוקדים');
  }
}