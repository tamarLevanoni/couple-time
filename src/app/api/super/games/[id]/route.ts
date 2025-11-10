import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateGameInstancePartialSchema } from '@/lib/validations';

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
 * Fetches a game instance that belongs to a center supervised by the super coordinator
 * @param gameInstanceId - ID of the game instance to fetch
 * @param superCoordinatorId - ID of the super coordinator
 * @returns Promise resolving to game instance object or null if not found/unauthorized
 */
async function fetchSupervisedGameInstance(gameInstanceId: string, superCoordinatorId: string) {
  return await prisma.gameInstance.findFirst({
    where: {
      id: gameInstanceId,
      center: {
        superCoordinatorId,
      },
    },
    include: {
      center: true,
      game: true,
    },
  });
}

/**
 * Checks if a game instance has active rentals that would prevent status changes
 * @param gameInstanceId - ID of the game instance to check
 * @returns Promise resolving to array of active rentals
 */
async function checkActiveRentals(gameInstanceId: string) {
  return await prisma.rental.findMany({
    where: {
      gameInstances: {
        some: { id: gameInstanceId }
      },
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });
}

/**
 * Validates status change for a game instance
 * @param newStatus - The new status to set
 * @param gameInstanceId - ID of the game instance
 * @returns Promise resolving to validation result
 */
async function validateStatusChange(newStatus: string, gameInstanceId: string) {
  if (newStatus === 'UNAVAILABLE') {
    const activeRentals = await checkActiveRentals(gameInstanceId);
    if (activeRentals.length > 0) {
      return { 
        error: apiResponse(false, null, { message: 'Cannot mark as unavailable - has active rentals' }, 400) 
      };
    }
  }
  return { success: true };
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
 * Updates a game instance with the provided data
 * @param gameInstanceId - ID of the game instance to update
 * @param updateData - Data to update the game instance with
 * @returns Promise resolving to updated game instance with related data
 */
async function updateGameInstanceData(gameInstanceId: string, updateData: any) {
  return await prisma.gameInstance.update({
    where: { id: gameInstanceId },
    data: updateData,
    include: {
      game: true,
      center: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * PUT /api/super/games/[id]
 * Updates a game instance (status, notes) at a center supervised by the super coordinator
 * Validates that the game instance can be updated based on current rental status
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const { id } = await params;
    const body = await req.json();
    const updateData = UpdateGameInstancePartialSchema.parse(body);

    const gameInstance = await fetchSupervisedGameInstance(id, authResult.token!.id);
    if (!gameInstance) {
      return apiResponse(false, null, { message: 'Game instance not found or access denied' }, 404);
    }

    if (updateData.status) {
      const statusValidation = await validateStatusChange(updateData.status, id);
      if (statusValidation.error) {
        return statusValidation.error;
      }
    }

    const cleanData = cleanUpdateData(updateData);
    if (Object.keys(cleanData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    const updatedGameInstance = await updateGameInstanceData(id, cleanData);
    return apiResponse(true, updatedGameInstance);
  } catch (error) {
    console.error('Error updating game instance:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}