import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateCenterSchema } from '@/lib/validations';
import { Role } from '@/types/schema';

const updateCenterSchema = UpdateCenterSchema;

/**
 * Validates that the requesting user is authenticated and has SUPER_COORDINATOR role
 * @param req - The incoming request object
 * @returns Object containing either the token or an error response
 */
async function validateSuperCoordinatorAuth(req: NextRequest) {
  const token = await getToken({ req }) as JWT | null;
  if (!token) {
    return { error: apiResponse(false, null, { message: 'Authentication required' }, 401) };
  }
  
  if (!token.roles?.includes('SUPER_COORDINATOR')) {
    return { error: apiResponse(false, null, { message: 'Access forbidden - super coordinator role required' }, 403) };
  }
  
  return { token };
}

/**
 * Fetches a specific center that the super coordinator supervises
 * @param centerId - ID of the center to fetch
 * @param superCoordinatorId - ID of the super coordinator
 * @returns Center object with related data or null if not found
 */
async function fetchSupervisedCenter(centerId: string, superCoordinatorId: string) {
  return await prisma.center.findFirst({
    where: {
      id: centerId,
      superCoordinatorId,
      isActive: true,
    },
    include: {
      coordinator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      gameInstances: {
        include: {
          game: {
            select: {
              id: true,
              name: true,
              categories: true,
              targetAudiences: true,
            },
          },
          rentals: {
            where: {
              status: { in: ['PENDING', 'ACTIVE'] },
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });
}

/**
 * Processes center data to create a structured response with statistics
 * @param center - Raw center data from database
 * @returns Processed center object with statistics and organized data
 */
function processCenterData(center: any) {
  const allRentals = center.gameInstances.flatMap((instance: any) => 
    instance.rentals.map((rental: any) => ({
      ...rental,
      gameInstance: {
        id: instance.id,
        status: instance.status,
        game: instance.game,
      },
    }))
  );

  return {
    id: center.id,
    name: center.name,
    area: center.area,
    isActive: center.isActive,
    coordinator: center.coordinator,
    gameInstances: center.gameInstances.map((instance: any) => ({
      id: instance.id,
      status: instance.status,
      notes: instance.notes,
      game: instance.game,
      activeRentalsCount: instance.rentals.length,
    })),
    rentals: allRentals.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    statistics: calculateCenterStatistics(center),
  };
}

/**
 * Calculates various statistics for a center
 * @param center - Center object with game instances and rentals
 * @returns Object containing comprehensive center statistics
 */
function calculateCenterStatistics(center: any) {
  const allRentals = center.gameInstances.flatMap((instance: any) => instance.rentals);
  
  return {
    totalGames: center.gameInstances.length,
    availableGames: center.gameInstances.filter((g: any) => g.status === 'AVAILABLE').length,
    borrowedGames: center.gameInstances.filter((g: any) => g.status === 'BORROWED').length,
    unavailableGames: center.gameInstances.filter((g: any) => g.status === 'UNAVAILABLE').length,
    pendingRentals: allRentals.filter((r: any) => r.status === 'PENDING').length,
    activeRentals: allRentals.filter((r: any) => r.status === 'ACTIVE').length,
  };
}

/**
 * Validates that a coordinator exists and has the proper role
 * @param coordinatorId - ID of the coordinator to validate
 * @returns Promise resolving to coordinator object or null if invalid
 */
async function validateCoordinator(coordinatorId: string) {
  return await prisma.user.findFirst({
    where: {
      id: coordinatorId,
      roles: { has: Role.CENTER_COORDINATOR },
      isActive: true,
    },
  });
}

/**
 * Cleans update data by removing undefined values
 * @param updateData - Raw update data object
 * @returns Cleaned object with only defined values
 */
function cleanUpdateData(updateData: any) {
  return Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value !== undefined)
  );
}

/**
 * GET /api/super/centers/[id]
 * Retrieves detailed information about a specific center supervised by the super coordinator
 * Returns center details, game instances, rentals, and statistics
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const { id } = await params;
    const center = await fetchSupervisedCenter(id, authResult.token!.id);

    if (!center) {
      return apiResponse(false, null, { message: 'Center not found or access denied' }, 404);
    }

    const processedCenter = processCenterData(center);
    return apiResponse(true, processedCenter);
  } catch (error) {
    console.error('Error fetching center details:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

/**
 * PUT /api/super/centers/[id]
 * Updates a center's information (name,area, coordinator)
 * Only super coordinators can update centers they supervise
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const { id } = await params;
    const body = await req.json();
    const updateData = updateCenterSchema.parse(body);

    const center = await prisma.center.findFirst({
      where: {
        id,
        superCoordinatorId: authResult.token!.id,
        isActive: true,
      },
    });

    if (!center) {
      return apiResponse(false, null, { message: 'Center not found or access denied' }, 404);
    }

    if (updateData.coordinatorId) {
      const coordinator = await validateCoordinator(updateData.coordinatorId);
      if (!coordinator) {
        return apiResponse(false, null, { message: 'Invalid coordinator ID' }, 400);
      }
    }

    const cleanData = cleanUpdateData(updateData);
    if (Object.keys(cleanData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    const updatedCenter = await prisma.center.update({
      where: { id },
      data: cleanData,
      include: {
        coordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return apiResponse(true, updatedCenter);
  } catch (error) {
    console.error('Error updating center:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}