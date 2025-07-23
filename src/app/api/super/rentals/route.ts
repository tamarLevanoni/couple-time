import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateManualRentalSchema } from '@/lib/validations';
import { createUserNameSearchConditions } from '@/lib/utils';
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
 * Builds the where clause for filtering rentals based on search parameters
 * @param token - Authenticated user token
 * @param status - Optional status filter
 * @param search - Optional search term for user name or rental notes
 * @returns Prisma where clause object
 */
function buildRentalsWhereClause(token: JWT, status?: string | null, firstName?: string | null, lastName?: string | null, notes?: string | null) {
  const whereClause: any = {
    gameInstances: {
      some: {
        center: {
          superCoordinatorId: token.id,
        },
      },
    },
  };

  if (status && ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
    whereClause.status = status;
  }

  // Handle specific field searches only (firstName, lastName, notes)
  if (firstName || lastName || notes) {
    const conditions = [];
    
    // Add name search conditions
    if (firstName || lastName) {
      const userData = {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
      };
      const userNameConditions = createUserNameSearchConditions(userData);
      conditions.push(...userNameConditions.map(condition => ({ user: condition })));
    }
    
    // Add notes search condition
    if (notes) {
      conditions.push({
        notes: {
          contains: notes,
          mode: 'insensitive',
        },
      });
    }
    
    whereClause.OR = conditions;
  }

  return whereClause;
}

/**
 * Fetches rentals for centers supervised by the super coordinator
 * @param whereClause - Prisma where clause for filtering
 * @returns Promise resolving to array of rentals with related data
 */
async function fetchSupervisedRentals(whereClause: any) {
  return await prisma.rental.findMany({
    where: whereClause,
    include: RENTALS_FOR_SUPER_COORDINATOR,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Validates game instances for rental creation
 * @param gameInstanceIds - Array of game instance IDs
 * @param superCoordinatorId - ID of the super coordinator
 * @returns Promise resolving to validation result with game instances or error
 */
async function validateGameInstancesForRental(gameInstanceIds: string[], superCoordinatorId: string) {
  const gameInstances = await prisma.gameInstance.findMany({
    where: {
      id: { in: gameInstanceIds },
      center: {
        superCoordinatorId,
      },
    },
    include: {
      game: true,
      center: true,
    },
  });

  if (gameInstances.length !== gameInstanceIds.length) {
    return { error: apiResponse(false, null, { message: 'One or more game instances not found at your supervised centers' }, 404) };
  }

  const centerIds = [...new Set(gameInstances.map(gi => gi.centerId))];
  if (centerIds.length > 1) {
    return { error: apiResponse(false, null, { message: 'All games must be from the same center' }, 400) };
  }

  const gameIds = gameInstances.map(gi => gi.gameId);
  const uniqueGameIds = [...new Set(gameIds)];
  if (gameIds.length !== uniqueGameIds.length) {
    return { error: apiResponse(false, null, { message: 'Cannot request duplicate games in the same rental' }, 400) };
  }

  return { gameInstances };
}

/**
 * Validates user and checks for existing rentals that would conflict
 * @param userId - ID of the user requesting rental
 * @param gameInstanceIds - Array of game instance IDs being requested
 * @returns Promise resolving to validation result with user or error
 */
async function validateUserAndExistingRentals(userId: string, gameInstanceIds: string[]) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
  });

  if (!user) {
    return { error: apiResponse(false, null, { message: 'User not found' }, 404) };
  }

  const existingRentals = await prisma.rental.findMany({
    where: {
      userId,
      gameInstances: {
        some: {
          id: { in: gameInstanceIds },
        },
      },
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (existingRentals.length > 0) {
    return { error: apiResponse(false, null, { message: 'User already has a pending or active rental for one or more of these games' }, 400) };
  }

  return { user };
}

/**
 * Creates a new rental with the provided data
 * @param userId - ID of the user
 * @param centerId - ID of the center
 * @param gameInstanceIds - Array of game instance IDs
 * @param expectedReturnDate - Optional expected return date (already transformed to Date)
 * @param notes - Optional notes for the rental
 * @returns Promise resolving to created rental with related data
 */
async function createRental(
  userId: string, 
  centerId: string, 
  gameInstanceIds: string[], 
  expectedReturnDate?: Date, 
  notes?: string
) {
  return await prisma.rental.create({
    data: {
      userId,
      centerId,
      status: 'PENDING',
      requestDate: new Date(),
      ...(expectedReturnDate && { expectedReturnDate }),
      notes,
      gameInstances: {
        connect: gameInstanceIds.map(id => ({ id })),
      },
    },
    include: RENTALS_FOR_SUPER_COORDINATOR,
  });
}

/**
 * GET /api/super/rentals
 * Retrieves rentals for all centers supervised by the super coordinator
 * Supports filtering by status and searching by user name or rental notes
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const notes = searchParams.get('notes');
    
    const whereClause = buildRentalsWhereClause(authResult.token!, status, firstName, lastName, notes);
    const rentals = await fetchSupervisedRentals(whereClause);

    return apiResponse(true, rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

/**
 * POST /api/super/rentals
 * Creates a new manual rental for a user at a supervised center
 * Validates game instances, user, and checks for conflicts before creation
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();
    const { userId, gameInstanceIds, expectedReturnDate, notes } = CreateManualRentalSchema.parse(body);

    const gameInstancesResult = await validateGameInstancesForRental(gameInstanceIds, authResult.token!.id);
    if (gameInstancesResult.error) {
      return gameInstancesResult.error;
    }

    const userResult = await validateUserAndExistingRentals(userId, gameInstanceIds);
    if (userResult.error) {
      return userResult.error;
    }

    const rental = await createRental(
      userId,
      gameInstancesResult.gameInstances![0].centerId,
      gameInstanceIds,
      expectedReturnDate,
      notes
    );

    return apiResponse(true, rental, undefined, 201);
  } catch (error) {
    console.error('Error creating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}