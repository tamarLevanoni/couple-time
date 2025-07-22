import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateUserSchema } from '@/lib/validations';
import { USERS_FOR_ADMIN } from '@/types/models';
import { assertAdminRole } from '@/lib/permissions';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { id: userId } = params;
    const body = await req.json();
    const updateData = UpdateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: cleanUpdateData,
      include: USERS_FOR_ADMIN,
    });

    return apiResponse(true, updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { id: userId } = params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Check for active rentals
    const activeRentals = await prisma.rental.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (activeRentals.length > 0) {
      return apiResponse(false, null, { message: 'Cannot delete user with active rentals' }, 400);
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return apiResponse(true, { message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}