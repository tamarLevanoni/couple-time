import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateGameSchema, UpdateGameSchema } from '@/lib/validations';
import { assertAdminRole } from '@/lib/permissions';

// Use centralized schemas - already include needed fields
const createGameSchema = CreateGameSchema;
const updateGameSchema = UpdateGameSchema;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    // Verify user is an admin
    await assertAdminRole(token);

    // Fetch all games with instance counts
    // No server-side filtering or pagination - client handles this
    const games = await prisma.game.findMany({
      include: {
        gameInstances:true,
        _count: {
          select: {
            gameInstances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(true, { games });
  } catch (error) {
    console.error('[GET /api/admin/games] Error:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    // Verify user is an admin
    await assertAdminRole(token);

    const body = await req.json();
    const gameData = createGameSchema.parse(body);

    // Create game
    const game = await prisma.game.create({
      data: gameData,
    });

    return apiResponse(true, game, undefined, 201);
  } catch (error) {
    console.error('[POST /api/admin/games] Error:', error);

    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }

    // Handle Prisma unique constraint violation (duplicate game name)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return apiResponse(false, null, { message: 'Game name already exists' }, 400);
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

