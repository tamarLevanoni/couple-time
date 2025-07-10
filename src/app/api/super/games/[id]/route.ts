import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { GameInstanceStatusSchema } from '@/lib/validations';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

const updateGameInstanceSchema = z.object({
  status: GameInstanceStatusSchema.optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { id } = params;
    const body = await req.json();
    const updateData = updateGameInstanceSchema.parse(body);

    // Find the game instance and verify access through supervised centers
    const gameInstance = await prisma.gameInstance.findFirst({
      where: {
        id,
        center: {
          superCoordinatorId: token.id,
        },
      },
      include: {
        center: true,
        game: true,
      },
    });

    if (!gameInstance) {
      return apiResponse(false, null, { message: 'Game instance not found or access denied' }, 404);
    }

    // If trying to mark as UNAVAILABLE, check for active rentals
    if (updateData.status === 'UNAVAILABLE') {
      const activeRentals = await prisma.rental.findMany({
        where: {
          gameInstanceId: id,
          status: { in: ['PENDING', 'ACTIVE'] },
        },
      });

      if (activeRentals.length > 0) {
        return apiResponse(false, null, { message: 'Cannot mark as unavailable - has active rentals' }, 400);
      }
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update game instance
    const updatedGameInstance = await prisma.gameInstance.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        game: true,
        center: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    return apiResponse(true, updatedGameInstance);
  } catch (error) {
    console.error('Error updating game instance:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}