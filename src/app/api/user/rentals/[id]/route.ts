import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { RENTAL_FOR_USER } from '@/types';
import { UpdateByUserRentalSchema } from '@/lib/validations';

/**
 * Validates user authentication and finds the rental by ID
 * Ensures the rental belongs to the authenticated user
 * @param req - NextRequest object containing authentication headers
 * @param rentalId - ID of the rental to find and validate
 * @returns Object with either the token and rental or an error response
 */
async function validateAuthAndFindRental(req: NextRequest, rentalId: string) {
  const token = await getToken({ req }) as JWT | null;
  if (!token) {
    return { error: apiResponse(false, null, { message: 'Authentication required' }, 401) };
  }

  const rental = await prisma.rental.findFirst({
    where: {
      id: rentalId,
      userId: token.id,
    },
    include: RENTAL_FOR_USER,
  });

  if (!rental) {
    return { error: apiResponse(false, null, { message: 'Rental not found' }, 404) };
  }

  if (rental.status !== 'PENDING') {
    return { error: apiResponse(false, null, { message: 'Only pending rentals can be updated' }, 400) };
  }

  return { token, rental };
}

/**
 * Validates game instances for rental updates
 * Ensures all games exist, belong to the same center as original rental, and have no duplicates
 * @param gameInstanceIds - Array of new game instance IDs
 * @param originalRental - The original rental being updated
 * @returns Object with either validated game instances or an error response
 */
async function validateGameInstancesForUpdate(gameInstanceIds: string[], originalRental: any) {
  const gameInstances = await prisma.gameInstance.findMany({
    where: {
      id: { in: gameInstanceIds },
    },
    select: {
      id: true,
      gameId: true,
      centerId: true,
      status: true,
    },
  });

  if (gameInstances.length !== gameInstanceIds.length) {
    return { error: apiResponse(false, null, { message: 'One or more game instances not found' }, 404) };
  }

  const centerIds = [...new Set(gameInstances.map(gi => gi.centerId))];
  if (centerIds.length > 1 || centerIds[0] !== originalRental.gameInstances[0]?.center?.id) {
    return { error: apiResponse(false, null, { message: 'All games must be from the same center as the original rental' }, 400) };
  }

  const gameIds = gameInstances.map(gi => gi.gameId);
  const uniqueGameIds = [...new Set(gameIds)];
  if (gameIds.length !== uniqueGameIds.length) {
    return { error: apiResponse(false, null, { message: 'Cannot request duplicate games in the same rental' }, 400) };
  }

  return { gameInstances };
}

/**
 * Checks for conflicts with existing rentals when updating game instances
 * Prevents having multiple active rentals for the same games
 * @param userId - ID of the user updating the rental
 * @param gameInstanceIds - New game instance IDs to check
 * @param currentRentalId - ID of the rental being updated (to exclude from conflict check)
 * @returns Object with either success confirmation or an error response
 */
async function checkRentalConflicts(userId: string, gameInstanceIds: string[], currentRentalId: string) {
  const existingRentals = await prisma.rental.findMany({
    where: {
      userId,
      id: { not: currentRentalId },
      gameInstances: {
        some: {
          id: { in: gameInstanceIds },
        },
      },
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (existingRentals.length > 0) {
    return { error: apiResponse(false, null, { message: 'You already have a pending or active rental for one or more of these games' }, 400) };
  }

  return { success: true };
}

/**
 * Cancels a rental by updating its status to CANCELLED
 * @param rentalId - ID of the rental to cancel
 * @param notes - Optional notes for the cancellation
 * @returns The updated rental with CANCELLED status
 */
async function cancelRental(rentalId: string, notes?: string) {
  return await prisma.rental.update({
    where: { id: rentalId },
    data: { status: 'CANCELLED', notes },
    include: RENTAL_FOR_USER,
  });
}

/**
 * Updates rental with new game instances
 * Replaces all current games with the new ones
 * @param rentalId - ID of the rental to update
 * @param gameInstanceIds - New game instance IDs to connect
 * @param notes - Optional notes for the update
 * @returns The updated rental with new game instances
 */
async function updateRentalGames(rentalId: string, gameInstanceIds: string[], notes?: string) {
  return await prisma.rental.update({
    where: { id: rentalId },
    data: {
      notes,
      gameInstances: {
        set: [],
        connect: gameInstanceIds.map(id => ({ id })),
      },
    },
    include: RENTAL_FOR_USER,
  });
}

/**
 * Updates only the notes of a rental
 * @param rentalId - ID of the rental to update
 * @param notes - New notes to save
 * @returns The updated rental with new notes
 */
async function updateRentalNotes(rentalId: string, notes?: string) {
  return await prisma.rental.update({
    where: { id: rentalId },
    data: { notes },
    include: RENTAL_FOR_USER,
  });
}

/**
 * PUT /api/user/rentals/[id]
 * Updates a user's rental - supports cancellation, game changes, and note updates
 * Only allows updates to PENDING rentals owned by the authenticated user
 * @param req - NextRequest object containing authentication and update data
 * @param params - Route parameters containing the rental ID
 * @returns API response with updated rental data or error
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, notes, gameInstanceIds } = UpdateByUserRentalSchema.parse(body);

    // Validate authentication and find rental. return error if not found rental or its not 'PENDING'
    const authResult = await validateAuthAndFindRental(req, id);
    if (authResult.error) {
      return authResult.error;
    }
    const { token, rental } = authResult;

    // Handle rental cancellation
    if (action === 'cancel') {
      const updatedRental = await cancelRental(id, notes);
      return apiResponse(true, updatedRental);
    }

    // Handle game instance changes
    if (gameInstanceIds && gameInstanceIds.length > 0) {
      // Validate new game instances
      const gameValidationResult = await validateGameInstancesForUpdate(gameInstanceIds, rental);
      if (gameValidationResult.error) {
        return gameValidationResult.error;
      }

      // Check for rental conflicts
      const conflictResult = await checkRentalConflicts(token!.id, gameInstanceIds, id);
      if (conflictResult.error) {
        return conflictResult.error;
      }

      // Update rental with new games
      const updatedRental = await updateRentalGames(id, gameInstanceIds, notes);
      return apiResponse(true, updatedRental);
    }

    // Update only notes if no other changes
    const updatedRental = await updateRentalNotes(id, notes);
    return apiResponse(true, updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
