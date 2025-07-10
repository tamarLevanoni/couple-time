import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        gameInstances: {
          select: {
            id: true,
            status: true,
            centerId: true,
            center: {
              select: {
                id: true,
                name: true,
                city: true,
                area: true
              }
            }
          }
        }
      }
    });

    return apiResponse(true, games);

  } catch (error) {
    console.error('Error fetching games:', error);
    return apiResponse(false, null, { message: 'Error fetching games' }, 500);
  }
}