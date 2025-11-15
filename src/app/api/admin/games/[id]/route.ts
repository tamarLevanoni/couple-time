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

    // Check if at least one field is being updated
    const hasUpdates = Object.values(updateData).some((value) => value !== undefined);
    if (!hasUpdates) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update game (Prisma ignores undefined values automatically)
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: updateData,
    });

    return apiResponse(true, updatedGame);
  } catch (error) {
    console.error('[PUT /api/admin/games/[id]] Error:', error);

    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }

    // Handle Prisma unique constraint violation (duplicate game name)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return apiResponse(false, null, { message: 'Game name already exists' }, 400);
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

    // Check if any game instances have rentals
    const instancesWithRentals = await prisma.gameInstance.findMany({
      where: {
        gameId,
        rentals: {
          some: {},
        },
      },
    });

    if (instancesWithRentals.length > 0) {
      return apiResponse(false, null, { message: 'Cannot delete game with existing rentals' }, 400);
    }

    // Delete game and all its instances in a transaction
    await prisma.$transaction([
      prisma.gameInstance.deleteMany({
        where: { gameId },
      }),
      prisma.game.delete({
        where: { id: gameId },
      }),
    ]);

    return apiResponse(true, { message: 'Game deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/admin/games/[id]] Error:', error);

    // Handle foreign key constraint violation
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2014' || error.code === 'P2003') {
        return apiResponse(
          false,
          null,
          { message: 'Cannot delete game with existing rentals' },
          400
        );
      }
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return apiResponse(false, null, { message: 'Game not found' }, 404);
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}