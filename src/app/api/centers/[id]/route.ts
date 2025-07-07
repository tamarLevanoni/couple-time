import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireSuperCoordinator, canAccessCenter } from '@/lib/api-auth';
import { updateCenterSchema } from '@/lib/validations';

// GET /api/centers/[id] - Get single center
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await canAccessCenter(request, params.id);
  
  const center = await prisma.center.findUnique({
    where: { id: params.id },
    include: {
      coordinator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      superCoordinator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      gameInstances: {
        include: {
          game: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
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
  
  if (!center) {
    return ApiResponseHelper.notFound('מוקד לא נמצא');
  }
  
  // Calculate stats
  const totalGames = center.gameInstances.length;
  const availableGames = center.gameInstances.filter(instance => 
    instance.status === 'AVAILABLE'
  ).length;
  const activeRentals = center.gameInstances.reduce((sum, instance) => 
    sum + instance.rentals.length, 0
  );
  
  // Get pending requests for this center
  const pendingRequests = await prisma.rental.count({
    where: {
      gameInstance: {
        centerId: params.id
      },
      status: 'PENDING'
    }
  });
  
  const centerWithStats = {
    ...center,
    stats: {
      totalGames,
      availableGames,
      activeRentals,
      pendingRequests,
    }
  };
  
  return ApiResponseHelper.success(centerWithStats);
});

// PUT /api/centers/[id] - Update center
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireSuperCoordinator(request);
  
  const body = await request.json();
  const data = updateCenterSchema.parse(body);
  
  const center = await prisma.center.update({
    where: { id: params.id },
    data,
    include: {
      coordinator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      superCoordinator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      gameInstances: {
        include: {
          game: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });
  
  // Calculate stats
  const totalGames = center.gameInstances.length;
  const availableGames = center.gameInstances.filter(instance => 
    instance.status === 'AVAILABLE'
  ).length;
  const activeRentals = center.gameInstances.reduce((sum, instance) => 
    sum + instance.rentals.length, 0
  );
  
  const pendingRequests = await prisma.rental.count({
    where: {
      gameInstance: {
        centerId: params.id
      },
      status: 'PENDING'
    }
  });
  
  const centerWithStats = {
    ...center,
    stats: {
      totalGames,
      availableGames,
      activeRentals,
      pendingRequests,
    }
  };
  
  return ApiResponseHelper.success(centerWithStats);
});

// DELETE /api/centers/[id] - Delete center
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireSuperCoordinator(request);
  
  // Check if center has any active rentals
  const activeRentals = await prisma.rental.count({
    where: {
      gameInstance: {
        centerId: params.id
      },
      status: 'ACTIVE'
    }
  });
  
  if (activeRentals > 0) {
    return ApiResponseHelper.error(
      'לא ניתן למחוק מוקד עם השאלות פעילות',
      400,
      'CENTER_HAS_ACTIVE_RENTALS'
    );
  }
  
  // Check if center has any game instances
  const gameInstancesCount = await prisma.gameInstance.count({
    where: { centerId: params.id }
  });
  
  if (gameInstancesCount > 0) {
    return ApiResponseHelper.error(
      'לא ניתן למחוק מוקד עם משחקים מוקצים',
      400,
      'CENTER_HAS_GAMES'
    );
  }
  
  await prisma.center.delete({
    where: { id: params.id }
  });
  
  return ApiResponseHelper.success({ message: 'מוקד נמחק בהצלחה' });
});