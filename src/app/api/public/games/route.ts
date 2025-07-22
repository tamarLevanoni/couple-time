import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { GAMES_PUBLIC_INFO } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const games = await prisma.game.findMany({
      orderBy: { name: 'asc' },
      select: GAMES_PUBLIC_INFO,
    });

    return apiResponse(true, games);

  } catch (error) {
    console.error('Error fetching public games:', error);
    return apiResponse(false, null, { message: 'שגיאה בטעינת המשחקים' }, 500);
  }
}