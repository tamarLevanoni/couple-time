import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateRentalSchema, RentalStatusSchema } from '@/lib/validations';
import { RENTAL_FOR_USER } from '@/types';

/**
 * Validates user authentication by checking JWT token
 * @param req - The NextRequest object containing authentication headers
 * @returns Object with either the token or an error response
 */
async function validateUserAuth(req: NextRequest) {
  const token = await getToken({ req }) as JWT | null;
  if (!token) {
    return { error: apiResponse(false, null, { message: 'Authentication required' }, 401) };
  }
  return { token };
}

/**
 * Validates game instances for user rental creation
 * Ensures all requested game instances exist, belong to the same center, and are not duplicates
 * @param gameInstanceIds - Array of game instance IDs to validate
 * @param centerId - Expected center ID that all games should belong to
 * @returns Object with either the validated game instances or an error response
 */
async function validateGameInstancesForUserRental(gameInstanceIds: string[], centerId: string) {
  const gameInstances = await prisma.gameInstance.findMany({
    where: {
      id: { in: gameInstanceIds },
    },
    select: {
      id: true,
      gameId: true,
      centerId: true,
    },
  });

  // Verify all requested game instances exist
  if (gameInstances.length !== gameInstanceIds.length) {
    return { error: apiResponse(false, null, { message: 'One or more game instances not found' }, 404) };
  }

  // Ensure all game instances belong to the same center
  const centerIds = [...new Set(gameInstances.map(gi => gi.centerId))];
  if (centerIds.length > 1 || centerId !== centerIds[0]) {
    return { error: apiResponse(false, null, { message: 'All games must be from the same center' }, 400) };
  }


  return { gameInstances };
}

/**
 * Checks if user already has pending or active rentals for any of the requested game instances
 * Prevents users from having multiple active rentals for the same games
 * @param userId - ID of the user making the rental request
 * @param gameInstanceIds - Array of game instance IDs to check for conflicts
 * @returns Object with either success confirmation or an error response
 */
async function checkExistingUserRentals(userId: string, gameInstanceIds: string[]) {
  const existingRental = await prisma.rental.findFirst({
    where: {
      userId,
      gameInstances: {
        some: {
          id: { in: gameInstanceIds },
        },
      },
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    select: { id: true },
  });

  // Prevent duplicate rentals for the same game instances
  if (existingRental) {
    return { error: apiResponse(false, null, {
      code: 'USER_ERROR',
      message: 'כבר יש לך בקשת השאלה ממתינה או פעילה עבור אחד או יותר מהמשחקים האלה'
    }, 400) };
  }

  return { success: true };
}

/**
 * Builds a Prisma where clause for filtering user rentals based on query parameters
 * Supports filtering by status and date range (dateFrom/dateTo)
 * @param params - Object containing userId, status, dateFrom, and dateTo filters
 * @returns Object with either the constructed where clause or an error response
 */
function buildUserRentalWhereClause({ userId, status, dateFrom, dateTo }: { userId: string, status: string | null, dateFrom: string | null, dateTo: string | null }) {
  const whereClause: any = { userId };

  // Add status filter if provided and valid
  if (status) {
    try {
      const validStatus = RentalStatusSchema.parse(status);
      whereClause.status = validStatus;
    } catch {
      return { error: apiResponse(false, null, { message: 'Invalid status parameter' }, 400) };
    }
  }

  // Add date range filter for start date
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    if (isNaN(fromDate.getTime())) {
      return { error: apiResponse(false, null, { message: 'Invalid dateFrom parameter' }, 400) };
    }
    whereClause.createdAt = { ...whereClause.createdAt, gte: fromDate };
  }

  // Add date range filter for end date
  if (dateTo) {
    const toDate = new Date(dateTo);
    if (isNaN(toDate.getTime())) {
      return { error: apiResponse(false, null, { message: 'Invalid dateTo parameter' }, 400) };
    }
    whereClause.createdAt = { ...whereClause.createdAt, lte: toDate };
  }

  return { whereClause };
}

/**
 * GET /api/user/rentals
 * Retrieves all rentals for the authenticated user with optional filtering
 * Supports query parameters: status, dateFrom, dateTo
 * @param req - NextRequest object containing authentication and query parameters
 * @returns API response with user's rental data or error
 */
export async function GET(req: NextRequest) {
  try {
    // Validate user authentication
    const authResult = await validateUserAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    // Extract query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build database query filters
    const { whereClause, error } = buildUserRentalWhereClause({
      userId: authResult.token!.id,
      status,
      dateFrom,
      dateTo,
    });
    if (error) return error;

    // Fetch filtered rentals for the user
    const rentals = await prisma.rental.findMany({
      where: whereClause,
      include: RENTAL_FOR_USER,
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(true, rentals);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

/**
 * POST /api/user/rentals
 * Creates a new rental request for the authenticated user
 * Validates game instances, prevents duplicates, and checks for existing rentals
 * @param req - NextRequest object containing authentication and rental data
 * @returns API response with created rental data or error
 */
export async function POST(req: NextRequest) {
  try {
    // Validate user authentication
    const authResult = await validateUserAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    // Parse and validate request body
    const body = await req.json();
    const { centerId, gameInstanceIds, notes } = CreateRentalSchema.parse(body);

    // Validate game instances exist and meet business rules
    const gameInstancesResult = await validateGameInstancesForUserRental(gameInstanceIds, centerId);
    if (gameInstancesResult.error) {
      return gameInstancesResult.error;
    }

    // Check for conflicting existing rentals
    const existingRentalsResult = await checkExistingUserRentals(authResult.token!.id, gameInstanceIds);
    if (existingRentalsResult.error) {
      return existingRentalsResult.error;
    }

    // Create the new rental request
    const rental = await prisma.rental.create({
      data: {
        userId: authResult.token!.id,
        centerId,
        status: 'PENDING',
        requestDate: new Date(),
        notes,
        gameInstances: {
          connect: gameInstanceIds.map(id => ({ id })),
        },
      },
      include: RENTAL_FOR_USER,
    });

    return apiResponse(true, rental, undefined, 201);
  } catch (error) {
    console.error('Error creating rental request:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
