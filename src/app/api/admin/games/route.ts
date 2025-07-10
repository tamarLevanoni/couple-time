import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateGameSchema, UpdateGameSchema } from '@/lib/validations';

// Extend base schemas for admin-specific fields if needed
const createGameSchema = CreateGameSchema.extend({
  duration: z.number().min(1).optional(),
  playersCount: z.string().optional(),
  instructions: z.string().optional(),
});

const updateGameSchema = UpdateGameSchema.extend({
  duration: z.number().min(1).optional(),
  playersCount: z.string().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const targetAudience = searchParams.get('targetAudience');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (targetAudience) {
      where.targetAudience = targetAudience;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          _count: {
            select: {
              gameInstances: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.game.count({ where }),
    ]);

    return apiResponse(true, {
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const body = await req.json();
    const gameData = createGameSchema.parse(body);

    // Create game
    const game = await prisma.game.create({
      data: {
        ...gameData,
      },
    });

    return apiResponse(true, game);
  } catch (error) {
    console.error('Error creating game:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('id');

    if (!gameId) {
      return apiResponse(false, null, { message: 'Game ID is required' }, 400);
    }

    const body = await req.json();
    const updateData = updateGameSchema.parse(body);

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!existingGame) {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: cleanUpdateData,
    });

    return apiResponse(true, updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('id');

    if (!gameId) {
      return apiResponse(false, null, { message: 'Game ID is required' }, 400);
    }

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    // Check for active game instances
    const activeInstances = await prisma.gameInstance.findMany({
      where: {
        gameId,
        status: { in: ['BORROWED'] },
      },
    });

    if (activeInstances.length > 0) {
      return apiResponse(false, null, { message: 'Cannot delete game with borrowed instances' }, 400);
    }

    // Soft delete by setting isActive to false
    await prisma.game.delete({
      where: { id: gameId },
    });

    return apiResponse(true, { message: 'Game deactivated successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}