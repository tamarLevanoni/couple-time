import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { CENTERS_FOR_SUPER_COORDINATOR } from '@/types/models';

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
 * Fetches centers supervised by the super coordinator from the database
 * @param superCoordinatorId - ID of the super coordinator
 * @returns Array of centers with related data
 */
async function fetchSupervisedCenters(superCoordinatorId: string) {
  return await prisma.center.findMany({
    where: {
      superCoordinatorId,
      isActive: true,
    },
    include: CENTERS_FOR_SUPER_COORDINATOR,
    orderBy: { name: 'asc' },
  });
}

/**
 * Calculates rental statistics for a center
 * @param center - Center object with game instances and rentals
 * @returns Object containing rental statistics
 */
function calculateCenterStatistics(center: any) {
  const allRentals = center.gameInstances.flatMap((gi: any) => gi.rentals);
  const pendingRentals = allRentals.filter((r: any) => r.status === 'PENDING').length;
  const activeRentals = allRentals.filter((r: any) => r.status === 'ACTIVE').length;
  
  return {
    totalGames: center._count.gameInstances,
    pendingRentals,
    activeRentals,
    totalActiveRentals: pendingRentals + activeRentals,
  };
}

/**
 * Processes centers data to include calculated statistics
 * @param centers - Array of raw center data from database
 * @returns Array of processed centers with statistics
 */
function processCentersWithStatistics(centers: any[]) {
  return centers.map(center => ({
    id: center.id,
    name: center.name,
    city: center.city,
    area: center.area,
    isActive: center.isActive,
    coordinator: center.coordinator,
    statistics: calculateCenterStatistics(center),
  }));
}

/**
 * GET /api/super/centers
 * Retrieves all centers supervised by the authenticated super coordinator
 * Returns centers with basic info, coordinator details, and rental statistics
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const centers = await fetchSupervisedCenters(authResult.token!.id);
    const processedCenters = processCentersWithStatistics(centers);

    return apiResponse(true, processedCenters);
  } catch (error) {
    console.error('Error fetching supervised centers:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}