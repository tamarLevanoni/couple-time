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

    // Find centers this user supervises
    const centers = await prisma.center.findMany({
      where: {
        superCoordinatorId: token.id,
        isActive: true,
      },
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        gameInstances: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            gameInstances: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Process centers to add basic statistics
    const processedCenters = centers.map(center => ({
      id: center.id,
      name: center.name,
      city: center.city,
      area: center.area,
      isActive: center.isActive,
      coordinator: center.coordinator,
      statistics: {
        totalGames: center._count.gameInstances,
        availableGames: center.gameInstances.filter(g => g.status === 'AVAILABLE').length,
        borrowedGames: center.gameInstances.filter(g => g.status === 'BORROWED').length,
        unavailableGames: center.gameInstances.filter(g => g.status === 'UNAVAILABLE').length,
      },
    }));

    return apiResponse(true, processedCenters);
  } catch (error) {
    console.error('Error fetching supervised centers:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}