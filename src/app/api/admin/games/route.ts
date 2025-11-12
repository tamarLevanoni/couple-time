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

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = limitParam ? parseInt(limitParam) : null; // null means no pagination
    const category = searchParams.get('category');
    const targetAudience = searchParams.get('targetAudience');
    const search = searchParams.get('search');

    const where: any = {};

    if (category) {
      where.categories = { has: category };
    }

    if (targetAudience) {
      where.targetAudiences = { has: targetAudience };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const queryOptions: any = {
      where,
      include: {
        _count: {
          select: {
            gameInstances: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    };

    // Only apply pagination if limit is provided
    if (limit) {
      const offset = (page - 1) * limit;
      queryOptions.take = limit;
      queryOptions.skip = offset;
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany(queryOptions),
      prisma.game.count({ where }),
    ]);

    return apiResponse(true, {
      games,
      pagination: limit ? {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      } : {
        total,
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
    
    // Verify user is an admin
    await assertAdminRole(token);

    const body = await req.json();
    const gameData = createGameSchema.parse(body);

    // Create game
    const game = await prisma.game.create({
      data: {
        ...gameData,
      },
    });

    return apiResponse(true, game, undefined, 201);
  } catch (error) {
    console.error('Error creating game:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

