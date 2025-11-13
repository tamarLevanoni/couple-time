import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateUserByAdminSchema } from '@/lib/validations';
import { USERS_FOR_ADMIN } from '@/types/models';
import { assertAdminRole } from '@/lib/permissions';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    // Verify user is an admin
    await assertAdminRole(token);

    const { id: userId } = await params;
    const body = await req.json();
    const updateData = UpdateUserByAdminSchema.parse(body);

    // Validate roles if provided
    if (updateData.roles !== undefined) {
      // Get current user with center assignments
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          managedCenter: true,
          supervisedCenters: true,
        },
      });

      if (!currentUser) {
        return apiResponse(false, null, { message: 'User not found' }, 404);
      }

      // Check if removing CENTER_COORDINATOR role while managedCenter exists
      const removingCoordinatorRole =
        currentUser.roles.includes('CENTER_COORDINATOR') &&
        !updateData.roles.includes('CENTER_COORDINATOR');

      if (removingCoordinatorRole && currentUser.managedCenter) {
        return apiResponse(
          false,
          null,
          { message: `Cannot remove CENTER_COORDINATOR role: user manages center "${currentUser.managedCenter.name}". Please reassign the center first.` },
          400
        );
      }

      // Check if removing SUPER_COORDINATOR role while supervisedCenters exist
      const removingSuperRole =
        currentUser.roles.includes('SUPER_COORDINATOR') &&
        !updateData.roles.includes('SUPER_COORDINATOR');

      if (removingSuperRole && currentUser.supervisedCenters.length > 0) {
        const centerNames = currentUser.supervisedCenters.map(c => c.name).join(', ');
        return apiResponse(
          false,
          null,
          { message: `Cannot remove SUPER_COORDINATOR role: user supervises ${currentUser.supervisedCenters.length} center(s): ${centerNames}. Please reassign the centers first.` },
          400
        );
      }
    }

    // Update user (Prisma ignores undefined values automatically)
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: USERS_FOR_ADMIN,
    });

    return apiResponse(true, user);
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

