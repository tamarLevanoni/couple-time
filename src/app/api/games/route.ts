import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createGameSchema } from '@/lib/validations';
import { GameCategory, TargetAudience } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as GameCategory | null;
    const targetAudience = searchParams.get('targetAudience') as TargetAudience | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Build where clause
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
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get games with availability counts
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          gameInstances: {
            where: { status: 'AVAILABLE' },
            select: { id: true, centerId: true }
          },
          _count: {
            select: { gameInstances: true }
          }
        }
      }),
      prisma.game.count({ where })
    ]);

    // Transform response to include availability data
    const gamesWithAvailability = games.map(game => ({
      id: game.id,
      name: game.name,
      description: game.description,
      category: game.category,
      targetAudience: game.targetAudience,
      imageUrl: game.imageUrl,
      availableCount: game.gameInstances.length,
      totalInstances: game._count.gameInstances,
      availableCenters: [...new Set(game.gameInstances.map(gi => gi.centerId))].length,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    }));

    return successResponse(gamesWithAvailability, {
      page,
      limit,
      total,
      hasNext: skip + limit < total,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Error fetching games:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המשחקים');
  }
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // Check permissions - only coordinators and admins can create games
    if (!user.roles.includes('CENTER_COORDINATOR') && 
        !user.roles.includes('SUPER_COORDINATOR') && 
        !user.roles.includes('ADMIN')) {
      return errorResponse('FORBIDDEN', 'אין הרשאה ליצור משחק');
    }

    const body = await request.json();
    const validatedData = createGameSchema.parse(body);

    const game = await prisma.game.create({
      data: {
        ...validatedData,
        createdBy: user.id
      }
    });

    return successResponse(game);

  } catch (error) {
    console.error('Error creating game:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse('VALIDATION_ERROR', 'נתונים לא תקינים');
    }
    return errorResponse('INTERNAL_ERROR', 'שגיאה ביצירת המשחק');
  }
});