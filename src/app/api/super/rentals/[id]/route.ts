import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateRentalByCoordinatorSchema } from '@/lib/validations';
import { RENTALS_FOR_SUPER_COORDINATOR } from '@/types/models';

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
 * Fetches a rental that belongs to centers supervised by the super coordinator
 * @param rentalId - ID of the rental to fetch
 * @param superCoordinatorId - ID of the super coordinator
 * @returns Promise resolving to rental object or null if not found/unauthorized
 */
async function fetchSupervisedRental(rentalId: string, superCoordinatorId: string) {
  return await prisma.rental.findFirst({
    where: {
      id: rentalId,
      gameInstances: {
        every: {
          center: {
            superCoordinatorId,
          },
        },
      },
    },
    include: RENTALS_FOR_SUPER_COORDINATOR,
  });
}

/**
 * Builds update data object based on the new status and notes
 * @param status - New rental status
 * @param notes - New or updated notes
 * @returns Object containing update data with appropriate timestamps
 */
function buildUpdateData(status?: string, notes?: string) {
  const updateData: any = {};
  
  if (status) {
    updateData.status = status;
    
    if (status === 'ACTIVE') {
      updateData.borrowDate = new Date();
    } else if (status === 'RETURNED') {
      updateData.returnDate = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }
  }
  
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  
  return updateData;
}

/**
 * Updates a rental with the provided data
 * @param rentalId - ID of the rental to update
 * @param updateData - Data to update the rental with
 * @returns Promise resolving to updated rental with related data
 */
async function updateRentalData(rentalId: string, updateData: any) {
  return await prisma.rental.update({
    where: { id: rentalId },
    data: updateData,
    include: RENTALS_FOR_SUPER_COORDINATOR,
  });
}

/**
 * Updates game instance statuses based on rental status change
 * @param rental - Rental object containing game instances
 * @param newStatus - New status that was set for the rental
 * @returns Promise resolving when game instances are updated
 */
async function updateGameInstanceStatuses(rental: any, newStatus: string) {
  const gameInstanceIds = rental.gameInstances.map((gi: any) => gi.id);
  
  if (newStatus === 'CANCELLED' || newStatus === 'RETURNED') {
    await prisma.gameInstance.updateMany({
      where: { 
        id: { in: gameInstanceIds },
      },
      data: { status: 'AVAILABLE' },
    });
  } else if (newStatus === 'ACTIVE') {
    await prisma.gameInstance.updateMany({
      where: { 
        id: { in: gameInstanceIds },
      },
      data: { status: 'BORROWED' },
    });
  }
}

/**
 * PUT /api/super/rentals/[id]
 * Updates a rental's status and/or notes for rentals at supervised centers
 * Automatically updates game instance statuses and sets appropriate timestamps
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const { id } = await params;
    const body = await req.json();
    const { status, notes } = UpdateRentalByCoordinatorSchema.parse(body);

    const rental = await fetchSupervisedRental(id, authResult.token!.id);
    if (!rental) {
      return apiResponse(false, null, { message: 'Rental not found or access denied' }, 404);
    }

    const updateData = buildUpdateData(status, notes);
    const updatedRental = await updateRentalData(id, updateData);

    if (status) {
      await updateGameInstanceStatuses(rental, status);
    }

    return apiResponse(true, updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}