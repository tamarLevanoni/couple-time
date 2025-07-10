import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const userId = token.id;
    
    // Find the center(s) this user coordinates
    const centers = await prisma.center.findMany({
      where: {
        coordinatorId: userId,
        isActive: true,
      },
      include: {
        // Get super coordinator info
        superCoordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        // Get game instances at this center with rentals
        gameInstances: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                targetAudience: true,
                imageUrl: true,
              },
            },
            rentals: {
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (centers.length === 0) {
      return apiResponse(false, null, { message: 'No centers found for this coordinator' }, 404);
    }

    // Process the data to create a cleaner response
    const processedCenters = centers.map(center => {
      // Extract all rentals from game instances
      const allRentals = center.gameInstances.flatMap(instance => 
        instance.rentals.map(rental => ({
          ...rental,
          gameInstance: {
            id: instance.id,
            status: instance.status,
            game: instance.game,
          },
        }))
      );

      // Get game instances without rentals for cleaner response
      const gameInstances = center.gameInstances.map(instance => ({
        id: instance.id,
        status: instance.status,
        notes: instance.notes,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
        game: instance.game,
        activeRentalsCount: instance.rentals.filter(r => r.status === 'ACTIVE').length,
        pendingRentalsCount: instance.rentals.filter(r => r.status === 'PENDING').length,
      }));

      return {
        id: center.id,
        name: center.name,
        city: center.city,
        area: center.area,
        isActive: center.isActive,
        superCoordinator: center.superCoordinator,
        gameInstances,
        rentals: allRentals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        statistics: {
          totalGames: gameInstances.length,
          availableGames: gameInstances.filter(g => g.status === 'AVAILABLE').length,
          borrowedGames: gameInstances.filter(g => g.status === 'BORROWED').length,
          pendingRentals: allRentals.filter(r => r.status === 'PENDING').length,
          activeRentals: allRentals.filter(r => r.status === 'ACTIVE').length,
          totalRentals: allRentals.length,
        },
      };
    });

    // If user coordinates multiple centers, return array; otherwise return single center
    const response = processedCenters.length === 1 ? processedCenters[0] : processedCenters;

    return apiResponse(true, response);
  } catch (error) {
    console.error('Error fetching coordinator data:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}