import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateManualRentalSchema, IdSchema } from '@/lib/validations';


export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const { userId, gameInstanceIds, expectedReturnDate, notes } = CreateManualRentalSchema.parse(body);

    // Verify all game instances exist and are at centers this user coordinates
    const gameInstances = await prisma.gameInstance.findMany({
      where: {
        id: { in: gameInstanceIds },
        center: {
          OR: [
            { coordinatorId: token.id },
            { superCoordinatorId: token.id },
          ],
        },
      },
      include: {
        game: true,
        center: true,
      },
    });

    if (gameInstances.length !== gameInstanceIds.length) {
      return apiResponse(false, null, { message: 'One or more game instances not found at your centers' }, 404);
    }

    // Verify all games are from the same center
    const centerIds = [...new Set(gameInstances.map(gi => gi.centerId))];
    if (centerIds.length > 1) {
      return apiResponse(false, null, { message: 'All games must be from the same center' }, 400);
    }

    // Check for duplicate games
    const gameIds = gameInstances.map(gi => gi.gameId);
    const uniqueGameIds = [...new Set(gameIds)];
    if (gameIds.length !== uniqueGameIds.length) {
      return apiResponse(false, null, { message: 'Cannot request duplicate games in the same rental' }, 400);
    }

    // Verify user exists
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
    });

    if (!user) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Check if user already has a pending/active rental for any of these game instances
    const existingRentals = await prisma.rental.findMany({
      where: {
        userId,
        gameInstances: {
          some: {
            id: { in: gameInstanceIds },
          },
        },
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingRentals.length > 0) {
      return apiResponse(false, null, { message: 'User already has a pending or active rental for one or more of these games' }, 400);
    }

    // Create rental
    const rental = await prisma.rental.create({
      data: {
        userId,
        status: 'PENDING',
        ...(expectedReturnDate && { expectedReturnDate: new Date(expectedReturnDate) }),
        notes,
        gameInstances: {
          connect: gameInstanceIds.map(id => ({ id })),
        },
      },
      include: {
        gameInstances: {
          include: {
            game: true,
            center: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return apiResponse(true, rental);
  } catch (error) {
    console.error('Error creating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}