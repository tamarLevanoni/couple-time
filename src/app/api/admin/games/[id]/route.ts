import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateGameSchema } from '@/lib/validations';
import { assertAdminRole } from '@/lib/permissions';

const updateGameSchema = UpdateGameSchema;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { id: gameId } = await params;
    const body = await req.json();
    const updateData = updateGameSchema.parse(body);

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!existingGame) {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: cleanUpdateData,
    });

    return apiResponse(true, updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { id: gameId } = await params;

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    // Check for active game instances
    const activeInstances = await prisma.gameInstance.findMany({
      where: {
        gameId,
        status: { in: ['BORROWED'] },
      },
    });

    if (activeInstances.length > 0) {
      return apiResponse(false, null, { message: 'Cannot delete game with borrowed instances' }, 400);
    }

    // Hard delete the game
    await prisma.game.delete({
      where: { id: gameId },
    });

    return apiResponse(true, { message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}