import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UserCreateRentalSchema, IdSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const { gameInstanceId, requestDate, expectedReturnDate, notes } = UserCreateRentalSchema.parse(body);

    // Verify game instance exists and is available
    const gameInstance = await prisma.gameInstance.findFirst({
      where: {
        id: gameInstanceId,
        status: 'AVAILABLE',
      },
      include: {
        game: true,
        center: true,
      },
    });

    if (!gameInstance) {
      return apiResponse(false, null, { message: 'Game instance not found or not available' }, 404);
    }

    // Check if user already has a pending/active rental for this game instance
    const existingRental = await prisma.rental.findFirst({
      where: {
        userId: token.id,
        gameInstanceId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingRental) {
      return apiResponse(false, null, { message: 'You already have a pending or active rental for this game' }, 400);
    }

    // Create rental request
    const rental = await prisma.rental.create({
      data: {
        userId: token.id,
        gameInstanceId,
        status: 'PENDING',
        requestDate,
        expectedReturnDate,
        notes,
      },
      include: {
        gameInstance: {
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
    console.error('Error creating rental request:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
