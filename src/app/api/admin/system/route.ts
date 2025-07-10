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

    // Get system statistics
    const [
      totalUsers,
      activeUsers,
      totalCenters,
      activeCenters,
      totalGames,
      totalGameInstances,
      borrowedGameInstances,
      totalRentals,
      activeRentals,
      pendingRentals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.center.count(),
      prisma.center.count({ where: { isActive: true } }),
      prisma.game.count(),
      prisma.gameInstance.count(),
      prisma.gameInstance.count({ where: { status: 'BORROWED' } }),
      prisma.rental.count(),
      prisma.rental.count({ where: { status: 'ACTIVE' } }),
      prisma.rental.count({ where: { status: 'PENDING' } }),
    ]);

    // Get user role distribution
    const usersByRole = await prisma.user.groupBy({
      by: ['roles'],
      _count: {
        id: true,
      },
      where: {
        isActive: true,
      },
    });

    // Get rental status distribution
    const rentalsByStatus = await prisma.rental.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get centers by area
    const centersByArea = await prisma.center.groupBy({
      by: ['area'],
      _count: {
        id: true,
      },
      where: {
        isActive: true,
      },
    });

    // Get games by category
    const gamesByCategory = await prisma.game.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = {
      newUsers: await prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      newRentals: await prisma.rental.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      newCenters: await prisma.center.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    };

    // System health indicators
    const systemHealth = {
      database: 'healthy', // Since we successfully executed queries
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    const systemStats = {
      overview: {
        totalUsers,
        activeUsers,
        totalCenters,
        activeCenters,
        totalGames,
        totalGameInstances,
        borrowedGameInstances,
        totalRentals,
        activeRentals,
        pendingRentals,
      },
      distributions: {
        usersByRole,
        rentalsByStatus,
        centersByArea,
        gamesByCategory,
      },
      recentActivity,
      systemHealth,
    };

    return apiResponse(true, systemStats);
  } catch (error) {
    console.error('Error fetching system statistics:', error);
    
    // Return partial health status even if some queries fail
    const systemHealth = {
      database: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return apiResponse(false, { systemHealth }, { message: 'Error fetching system statistics' }, 500);
  }
}