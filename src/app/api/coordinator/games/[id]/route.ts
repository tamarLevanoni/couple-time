import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateGameInstancePartialSchema } from '@/lib/validations';
import { GAME_INSTANCE_WITH_CENTER, GAME_INSTANCE_WITH_CENTER_AND_ACTIVE_RENTALS } from '@/types/models';
import { AccessDeniedError, assertGameInstanceAccess, ResourceNotFoundError } from '@/lib/permissions';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    const { id } = await params;

    const body = await req.json();
    const updateData = UpdateGameInstancePartialSchema.parse(body);

    // Find the game instance and verify access, including rentals if checking for unavailable status
    const gameInstance = await prisma.gameInstance.findFirst({
      where: { id },
      select: { id: true, status:true, center: { select: { coordinatorId: true } } },
    });
    if (!gameInstance) throw new ResourceNotFoundError('Game instance not found');
    if (gameInstance.center.coordinatorId !== token.id) throw new AccessDeniedError();

    // If trying to mark as UNAVAILABLE, check for active rentals
    if (
      updateData.status === 'UNAVAILABLE' &&
      gameInstance.status === 'BORROWED'
    ) {
      return apiResponse(
        false,
        null,
        { message: 'Cannot mark as unavailable - has active rentals' },
        400
      );
    }
    
    if (updateData.expectedReturnDate && gameInstance.status != 'BORROWED') {
      return apiResponse(
        false,
        null,
        { message: 'Cannot change expected Return Date to unborrowed' },
        400
      );
    }

    // Update game instance
    const updatedGameInstance = await prisma.gameInstance.update({
      where: { id },
      data: updateData,
      include: GAME_INSTANCE_WITH_CENTER,
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