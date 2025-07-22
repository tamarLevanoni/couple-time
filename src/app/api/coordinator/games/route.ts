import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateGameInstanceSchema } from '@/lib/validations';
import { GAME_INSTANCE_WITH_GAME, GAME_INSTANCE_WITH_CENTER } from '@/types/models';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    
    const userId = token.id;
    
    // Get game instances for this coordinator in a single query
    const center = await prisma.center.findFirst({
      where: {
        coordinatorId: userId,
      },
      select: {
        gameInstances:{
          include: GAME_INSTANCE_WITH_GAME,
          orderBy: { createdAt: 'desc' },
        }
      },
    });

    const gameInstances = center?.gameInstances ?? [];

    return apiResponse(true, gameInstances);
  } catch (error) {
    console.error('Error fetching game instances:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
