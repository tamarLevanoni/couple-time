import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        gameInstances: {
          select: {
            id: true,
            status: true,
            expectedReturnDate: true,
            centerId: true
          }
        }
      }
    });

    return successResponse(games);

  } catch (error) {
    console.error('Error fetching games:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המשחקים');
  }
}