import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateRentalSchema, IdSchema } from '@/lib/validations';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

// Extend base schema for coordinator rental creation
const createRentalSchema = CreateRentalSchema.extend({
  userId: IdSchema, // Required for coordinator creating rentals for users
  requestDate: z.coerce.date(),
  expectedReturnDate: z.coerce.date(),
});


export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const { userId, gameInstanceId, requestDate, expectedReturnDate, notes } = createRentalSchema.parse(body);

    // Verify game instance exists and is at a center this user coordinates
    const gameInstance = await prisma.gameInstance.findFirst({
      where: {
        id: gameInstanceId,
        status: 'AVAILABLE',
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

    if (!gameInstance) {
      return apiResponse(false, null, { message: 'Game instance not found or not available at your center' }, 404);
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

    // Check if user already has a pending/active rental for this game instance
    const existingRental = await prisma.rental.findFirst({
      where: {
        userId,
        gameInstanceId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingRental) {
      return apiResponse(false, null, { message: 'User already has a pending or active rental for this game' }, 400);
    }

    // Create rental
    const rental = await prisma.rental.create({
      data: {
        userId,
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
    console.error('Error creating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}