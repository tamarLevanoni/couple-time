import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateRentalSchema } from '@/lib/validations';
import { RENTAL_FOR_USER } from '@/types';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const { id } = params;
    const body = await req.json();
    const { status, notes, gameInstanceIds } = UpdateRentalSchema.parse(body);

    // Find the rental and verify ownership using predefined query object
    const rental = await prisma.rental.findFirst({
      where: {
        id,
        userId: token.id,
      },
      include: RENTAL_FOR_USER,
    });

    if (!rental) {
      return apiResponse(false, null, { message: 'Rental not found' }, 404);
    }

    // Check if rental can be updated
    if (rental.status !== 'PENDING') {
      return apiResponse(false, null, { message: 'Only pending rentals can be updated' }, 400);
    }

    // Handle status changes (cancellation)
    if (status && status === 'CANCELLED') {
      const updatedRental = await prisma.rental.update({
        where: { id },
        data: { status: 'CANCELLED', notes },
        include: RENTAL_FOR_USER,
      });
      return apiResponse(true, updatedRental);
    }

    // Handle game changes
    if (gameInstanceIds && gameInstanceIds.length > 0) {
      // Validate new game instances
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
      if (centerIds.length > 1 || centerIds[0] !== rental.gameInstances[0]?.center?.id) {
        return apiResponse(false, null, { message: 'All games must be from the same center as the original rental' }, 400);
      }

      // Check for duplicate games
      const gameIds = gameInstances.map(gi => gi.gameId);
      const uniqueGameIds = [...new Set(gameIds)];
      if (gameIds.length !== uniqueGameIds.length) {
        return apiResponse(false, null, { message: 'Cannot request duplicate games in the same rental' }, 400);
      }

      // Check for conflicts with other rentals (excluding current rental)
      const existingRentals = await prisma.rental.findMany({
        where: {
          userId: token.id,
          id: { not: id }, // Exclude current rental
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

      // Update rental with new games
      const updatedRental = await prisma.rental.update({
        where: { id },
        data: {
          notes,
          gameInstances: {
            set: [], // Disconnect all current games
            connect: gameInstanceIds.map(id => ({ id })), // Connect new games
          },
        },
        include: RENTAL_FOR_USER,
      });
      return apiResponse(true, updatedRental);
    }

    // Update only notes if no status or games changes
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: { notes },
      include: RENTAL_FOR_USER,
    });

    return apiResponse(true, updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
