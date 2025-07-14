import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateRentalSchema } from '@/lib/validations';
import { RENTAL_FOR_USER } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    // Fetch user rentals using predefined query object
    const rentals = await prisma.rental.findMany({
      where: { userId: token.id },
      include: RENTAL_FOR_USER,
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(true, rentals);
  } catch (error) {
    console.error('Error fetching user rentals:', error);
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
    const {centerId, gameInstanceIds, notes } = CreateRentalSchema.parse(body);

    // Verify all game instances exist and get necessary info for validation
    const gameInstances = await prisma.gameInstance.findMany({
      where: {
        id: { in: gameInstanceIds },
      },
      select: {
        id: true,
        gameId: true,
        centerId: true,
        status: true,
      },
    });

    if (gameInstances.length !== gameInstanceIds.length) {
      return apiResponse(false, null, { message: 'One or more game instances not found' }, 404);
    }

    // Verify all games are from the same center
    const centerIds = [...new Set(gameInstances.map(gi => gi.centerId))];
    if (centerIds.length > 1 || centerId != centerIds[0]) {
      return apiResponse(
        false,
        null,
        { message: 'All games must be from the same center' },
        400
      );
    }

    // Check for duplicate games
    const gameIds = gameInstances.map(gi => gi.gameId);
    const uniqueGameIds = [...new Set(gameIds)];
    if (gameIds.length !== uniqueGameIds.length) {
      return apiResponse(false, null, { message: 'Cannot request duplicate games in the same rental' }, 400);
    }

    // Check if user already has a pending/active rental for any of these game instances
    const existingRentals = await prisma.rental.findMany({
      where: {
        userId: token.id,
        gameInstances: {
          some: {
            id: { in: gameInstanceIds },
          },
        },
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingRentals.length > 0) {
      return apiResponse(false, null, { message: 'You already have a pending or active rental for one or more of these games' }, 400);
    }

    // Create rental request using predefined query object
    const rental = await prisma.rental.create({
      data: {
        userId: token.id,
        centerId,
        status: 'PENDING',
        notes,
        gameInstances: {
          connect: gameInstanceIds.map(id => ({ id })),
        },
      },
      include: RENTAL_FOR_USER,
    });

    return apiResponse(true, rental);
  } catch (error) {
    console.error('Error creating rental request:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
