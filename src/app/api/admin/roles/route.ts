import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { AssignRoleSchema } from '@/lib/validations';
import { assertAdminRole } from '@/lib/permissions';

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const body = await req.json();
    const roleData = AssignRoleSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: roleData.userId },
    });

    if (!existingUser) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Validate managed center ID if provided
    if (roleData.managedCenterId) {
      const center = await prisma.center.findFirst({
        where: {
          id: roleData.managedCenterId,
          isActive: true,
        },
      });

      if (!center) {
        return apiResponse(false, null, { message: 'Managed center not found' }, 404);
      }
    }

    // Handle supervised centers assignment
    if (roleData.supervisedCenterIds) {
      // First, remove this user as supervisor from all centers
      await prisma.center.updateMany({
        where: { superCoordinatorId: roleData.userId },
        data: { superCoordinatorId: null },
      });

      // Then assign this user as supervisor to the specified centers
      if (roleData.supervisedCenterIds.length > 0) {
        const centerCount = await prisma.center.count({
          where: {
            id: { in: roleData.supervisedCenterIds },
            isActive: true,
          },
        });

        if (centerCount !== roleData.supervisedCenterIds.length) {
          return apiResponse(false, null, { message: 'One or more supervised center IDs are invalid' }, 400);
        }

        await prisma.center.updateMany({
          where: { id: { in: roleData.supervisedCenterIds } },
          data: { superCoordinatorId: roleData.userId },
        });
      }
    }

    // Update user roles and center assignments
    const updatedUser = await prisma.user.update({
      where: { id: roleData.userId },
      data: {
        roles: roleData.roles,
        managedCenterId: roleData.managedCenterId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        managedCenterId: true,
        supervisedCenters: { select: { id: true, name: true } },
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiResponse(true, updatedUser);
  } catch (error) {
    console.error('Error assigning roles:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}