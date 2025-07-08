import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { GameInstanceStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as GameInstanceStatus | null;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Check if center exists and is active
    const center = await prisma.center.findUnique({
      where: { id },
      select: { id: true, isActive: true }
    });

    if (!center) {
      return errorResponse('NOT_FOUND', 'המוקד לא נמצא');
    }

    if (!center.isActive) {
      return errorResponse('NOT_FOUND', 'המוקד לא פעיל');
    }

    // Build where clause
    const where: any = {
      centerId: id
    };
    
    if (status) {
      where.status = status;
    }
    
    // Add game filters
    if (category || search) {
      where.game = {};
      if (category) {
        where.game.category = category;
      }
      if (search) {
        where.game.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    // Get game instances with game details
    const [gameInstances, total] = await Promise.all([
      prisma.gameInstance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { game: { name: 'asc' } },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              targetAudience: true,
              imageUrl: true
            }
          },
          rentals: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              expectedReturnDate: true,
              user: {
                select: { 
                  id: true,
                  name: true 
                }
              }
            }
          }
        }
      }),
      prisma.gameInstance.count({ where })
    ]);

    // Transform response
    const gamesWithDetails = gameInstances.map(instance => ({
      instanceId: instance.id,
      gameId: instance.game.id,
      game: instance.game,
      status: instance.status,
      expectedReturnDate: instance.expectedReturnDate,
      currentRental: instance.rentals[0] || null,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt
    }));

    return successResponse(gamesWithDetails, {
      page,
      limit,
      total,
      hasNext: skip + limit < total,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Error fetching center games:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת משחקי המוקד');
  }
}