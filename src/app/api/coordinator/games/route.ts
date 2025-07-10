import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateGameInstanceSchema, IdSchema } from '@/lib/validations';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

// Use centralized schema - already has gameId, centerId, notes
const createGameInstanceSchema = CreateGameInstanceSchema;

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const body = await req.json();
    const { gameId, centerId, notes } = createGameInstanceSchema.parse(body);

    // Verify the coordinator has access to this center
    const center = await prisma.center.findFirst({
      where: {
        id: centerId,
        OR: [
          { coordinatorId: token.id },
          { superCoordinatorId: token.id },
        ],
        isActive: true,
      },
    });

    if (!center) {
      return apiResponse(false, null, { message: 'Center not found or access denied' }, 404);
    }

    // Verify the game exists
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    // Create game instance
    const gameInstance = await prisma.gameInstance.create({
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
            city: true,
          },
        },
      },
    });

    return apiResponse(true, gameInstance);
  } catch (error) {
    console.error('Error creating game instance:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}