import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateCenterSchema } from '@/lib/validations';
import { Role } from '@/types/schema';
import { assertAdminRole } from '@/lib/permissions';

const updateCenterSchema = UpdateCenterSchema;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { id: centerId } = params;
    const body = await req.json();
    const updateData = updateCenterSchema.parse(body);

    // Check if center exists
    const existingCenter = await prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!existingCenter) {
      return apiResponse(false, null, { message: 'Center not found' }, 404);
    }

    // Verify coordinators if being updated
    if (updateData.coordinatorId) {
      const coordinator = await prisma.user.findFirst({
        where: {
          id: updateData.coordinatorId,
          roles: { has: Role.CENTER_COORDINATOR },
          isActive: true,
        },
      });

      if (!coordinator) {
        return apiResponse(false, null, { message: 'Invalid coordinator ID' }, 400);
      }
    }

    if (updateData.superCoordinatorId) {
      const superCoordinator = await prisma.user.findFirst({
        where: {
          id: updateData.superCoordinatorId,
          roles: { has: Role.SUPER_COORDINATOR },
          isActive: true,
        },
      });

      if (!superCoordinator) {
        return apiResponse(false, null, { message: 'Invalid super coordinator ID' }, 400);
      }
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update center
    const updatedCenter = await prisma.center.update({
      where: { id: centerId },
      data: cleanUpdateData,
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        superCoordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return apiResponse(true, updatedCenter);
  } catch (error) {
    console.error('Error updating center:', error);
    
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

    const { id: centerId } = params;

    // Check if center exists
    const center = await prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!center) {
      return apiResponse(false, null, { message: 'Center not found' }, 404);
    }

    // Check for active game instances
    const activeGameInstances = await prisma.gameInstance.findMany({
      where: {
        centerId,
        status: { in: ['BORROWED'] },
      },
    });

    if (activeGameInstances.length > 0) {
      return apiResponse(false, null, { message: 'Cannot delete center with borrowed games' }, 400);
    }

    // Soft delete by setting isActive to false
    await prisma.center.update({
      where: { id: centerId },
      data: { isActive: false },
    });

    return apiResponse(true, { message: 'Center deactivated successfully' });
  } catch (error) {
    console.error('Error deleting center:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}