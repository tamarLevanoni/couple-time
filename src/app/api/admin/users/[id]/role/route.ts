import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { AssignRoleSchema } from '@/lib/validations';
import { USERS_FOR_ADMIN } from '@/types/models';
import { assertAdminRole } from '@/lib/permissions';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    // Verify user is an admin
    await assertAdminRole(token);

    const { id: userId } = await params;
    const body = await req.json();
    const roleData = AssignRoleSchema.parse(body);

    // Validation: Cannot remove ADMIN role from self
    if (userId === token.id && !roleData.roles.includes('ADMIN')) {
      return apiResponse(
        false,
        null,
        { message: 'Cannot remove ADMIN role from yourself' },
        403
      );
    }

    // Validation: Regular user cannot have center assignments
    const hasCoordinatorRole = roleData.roles.includes('CENTER_COORDINATOR');
    const hasSuperRole = roleData.roles.includes('SUPER_COORDINATOR');
    const isRegularUser = roleData.roles.length==0;

    if (isRegularUser && (roleData.managedCenterId || roleData.supervisedCenterIds?.length)) {
      return apiResponse(
        false,
        null,
        { message: 'Regular users cannot have center assignments' },
        400
      );
    }

    const warnings: string[] = [];

    // Warning: CENTER_COORDINATOR without managedCenterId
    if (hasCoordinatorRole && !roleData.managedCenterId) {
      warnings.push('Center coordinator role assigned without a managed center');
    }

    // Warning: SUPER_COORDINATOR without supervisedCenterIds
    if (hasSuperRole && (!roleData.supervisedCenterIds || roleData.supervisedCenterIds.length === 0)) {
      warnings.push('Super coordinator role assigned without supervised centers');
    }

    // Warning: Removing coordinator with active rentals (need to check current state)
    if (!hasCoordinatorRole || !roleData.managedCenterId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { managedCenterId: true },
      });

      if (currentUser?.managedCenterId) {
        const activeRentals = await prisma.rental.count({
          where: {
            centerId: currentUser.managedCenterId,
            status: { in: ['PENDING', 'ACTIVE'] },
          },
        });

        if (activeRentals > 0) {
          warnings.push(
            `Removing coordinator from center with ${activeRentals} active rental(s)`
          );
        }
      }
    }

    // Update user roles, managed center, and supervised centers
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: roleData.roles,
        managedCenterId: hasCoordinatorRole ? roleData.managedCenterId : null,
        supervisedCenters: {
          set: hasSuperRole && roleData.supervisedCenterIds?.length
            ? roleData.supervisedCenterIds.map(id => ({ id }))
            : [],
        },
      },
      include: USERS_FOR_ADMIN,
    });

    return apiResponse(true, {
      user,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error('Error assigning role:', error);

    if (error instanceof z.ZodError) {
      return apiResponse(
        false,
        null,
        { message: 'Invalid request data', details: error.errors },
        400
      );
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
