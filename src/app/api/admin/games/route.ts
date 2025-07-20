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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const targetAudience = searchParams.get('targetAudience');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

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

