import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateGameInstanceSchema } from '@/lib/validations';

const createGameInstanceSchema = CreateGameInstanceSchema.omit({ status: true });

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
 * Validates that a center exists and is supervised by the super coordinator
 * @param centerId - ID of the center to validate
 * @param superCoordinatorId - ID of the super coordinator
 * @returns Promise resolving to center object or null if invalid
 */
async function validateSupervisedCenter(centerId: string, superCoordinatorId: string) {
  return await prisma.center.findFirst({
    where: {
      id: centerId,
      superCoordinatorId,
      isActive: true,
    },
  });
}

/**
 * Validates that a game exists in the system
 * @param gameId - ID of the game to validate
 * @returns Promise resolving to game object or null if not found
 */
async function validateGameExists(gameId: string) {
  return await prisma.game.findFirst({
    where: {
      id: gameId,
    },
  });
}

/**
 * Creates a new game instance at a supervised center
 * @param gameId - ID of the game to create instance for
 * @param centerId - ID of the center where instance will be created
 * @param notes - Optional notes for the game instance
 * @returns Promise resolving to created game instance with related data
 */
async function createGameInstance(gameId: string, centerId: string, notes?: string) {
  return await prisma.gameInstance.create({
    data: {
      gameId,
      centerId,
      status: 'AVAILABLE',
      notes,
    },
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
 * POST /api/super/games
 * Creates a new game instance at a center supervised by the super coordinator
 * The game instance is automatically set to AVAILABLE status
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateSuperCoordinatorAuth(req);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();
    const { gameId, centerId, notes } = createGameInstanceSchema.parse(body);

    const center = await validateSupervisedCenter(centerId, authResult.token!.id);
    if (!center) {
      return apiResponse(false, null, { message: 'Center not found or access denied' }, 404);
    }

    const game = await validateGameExists(gameId);
    if (!game) {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    const gameInstance = await createGameInstance(gameId, centerId, notes);
    return apiResponse(true, gameInstance, undefined, 201);
  } catch (error) {
    console.error('Error creating game instance:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}