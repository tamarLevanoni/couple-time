import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth } from '@/lib/api-auth';
import { RentalStatus, GameInstanceStatus } from '@prisma/client';

// GET /api/dashboard/stats - Get dashboard statistics
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireAuth(request);
  
  // Role-based stats
  if (user.roles.includes('USER')) {
    // User dashboard stats
    const [totalRentals, activeRentals, pendingRentals] = await Promise.all([
      prisma.rental.count({
        where: { userId: user.id }
      }),
      prisma.rental.count({
        where: { userId: user.id, status: RentalStatus.ACTIVE }
      }),
      prisma.rental.count({
        where: { userId: user.id, status: RentalStatus.PENDING }
      }),
    ]);
    
    return ApiResponseHelper.success({
      userStats: {
        totalRentals,
        activeRentals,
        pendingRentals,
        returnedRentals: totalRentals - activeRentals - pendingRentals,
      }
    });
  }
  
  // Coordinator dashboard stats
  if (user.roles.includes('CENTER_COORDINATOR')) {
    const centerFilter = {
      gameInstance: {
        center: {
          coordinatorId: user.id
        }
      }
    };
    
    const [
      totalRentals,
      activeRentals,
      pendingRentals,
      overdueRentals,
      totalGames,
      availableGames
    ] = await Promise.all([
      prisma.rental.count({
        where: centerFilter
      }),
      prisma.rental.count({
        where: { ...centerFilter, status: RentalStatus.ACTIVE }
      }),
      prisma.rental.count({
        where: { ...centerFilter, status: RentalStatus.PENDING }
      }),
      prisma.rental.count({
        where: {
          ...centerFilter,
          status: RentalStatus.ACTIVE,
          expectedReturnDate: {
            lt: new Date()
          }
        }
      }),
      prisma.gameInstance.count({
        where: {
          center: {
            coordinatorId: user.id
          }
        }
      }),
      prisma.gameInstance.count({
        where: {
          center: {
            coordinatorId: user.id
          },
          status: GameInstanceStatus.AVAILABLE
        }
      }),
    ]);
    
    return ApiResponseHelper.success({
      coordinatorStats: {
        totalRentals,
        activeRentals,
        pendingRentals,
        overdueRentals,
        totalGames,
        availableGames,
        borrowedGames: totalGames - availableGames,
      }
    });
  }
  
  // Super coordinator / Admin dashboard stats
  if (user.roles.includes('SUPER_COORDINATOR') || user.roles.includes('ADMIN')) {
    const [
      totalUsers,
      totalCenters,
      totalGames,
      totalRentals,
      activeRentals,
      pendingRentals,
      overdueRentals,
      availableGames,
      borrowedGames
    ] = await Promise.all([
      prisma.user.count({
        where: { isActive: true }
      }),
      prisma.center.count({
        where: { isActive: true }
      }),
      prisma.game.count({
        where: { isActive: true }
      }),
      prisma.rental.count(),
      prisma.rental.count({
        where: { status: RentalStatus.ACTIVE }
      }),
      prisma.rental.count({
        where: { status: RentalStatus.PENDING }
      }),
      prisma.rental.count({
        where: {
          status: RentalStatus.ACTIVE,
          expectedReturnDate: {
            lt: new Date()
          }
        }
      }),
      prisma.gameInstance.count({
        where: { status: GameInstanceStatus.AVAILABLE }
      }),
      prisma.gameInstance.count({
        where: { status: GameInstanceStatus.BORROWED }
      }),
    ]);
    
    // Recent activity
    const recentRentals = await prisma.rental.findMany({
      take: 10,
      orderBy: { requestDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        gameInstance: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
              }
            },
            center: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
    
    return ApiResponseHelper.success({
      systemStats: {
        totalUsers,
        totalCenters,
        totalGames,
        totalRentals,
        activeRentals,
        pendingRentals,
        overdueRentals,
        availableGames,
        borrowedGames,
      },
      recentActivity: recentRentals,
    });
  }
  
  return ApiResponseHelper.forbidden('אין הרשאה לצפות בסטטיסטיקות');
});