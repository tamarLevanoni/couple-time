import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { z } from 'zod';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { assertAdminRole } from '@/lib/permissions';
import { UpdateCenterSchema } from '@/lib/validations';
import { CENTERS_FOR_ADMIN } from '@/types/models';
import { validateCoordinator, validateSuperCoordinator } from '../_helpers';

/**
 * PUT /api/admin/centers/[id]
 * Updates center details with validation and auto-deactivation logic
 * - Auto-deactivates if removing coordinator from active center
 * - Blocks activation without coordinator
 * - Warns if activating without super coordinator
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    await assertAdminRole(token);

    const { id: centerId } = await params;
    const body = await req.json();
    console.log("🚀 ~ PUT ~ body:", body)
    const updateData = UpdateCenterSchema.parse(body);

    // Check if center exists
    const existingCenter = await prisma.center.findUnique({
      where: { id: centerId },
      select: {
        id: true,
        name: true,
        isActive: true,
        coordinatorId: true,
        superCoordinatorId: true,
      },
    });

    if (!existingCenter) {
      return apiResponse(false, null, { message: 'Center not found' }, 404);
    }

    // Check if at least one field is being updated
    console.log("🚀 ~ PUT ~ updateData:",  updateData)
    const hasUpdates = Object.values(updateData).some((value) => value !== undefined);
    if (!hasUpdates) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Validate coordinator and super coordinator
    if (updateData.coordinatorId !== undefined && updateData.coordinatorId) {
      await validateCoordinator(updateData.coordinatorId);
    }

    if (updateData.superCoordinatorId !== undefined && updateData.superCoordinatorId) {
      await validateSuperCoordinator(updateData.superCoordinatorId);
    }

    const warnings: string[] = [];

    // Determine final values
    const finalCoordinatorId =
      updateData.coordinatorId !== undefined
        ? updateData.coordinatorId
        : existingCenter.coordinatorId;

    const finalSuperCoordinatorId =
      updateData.superCoordinatorId !== undefined
        ? updateData.superCoordinatorId
        : existingCenter.superCoordinatorId;

    // Determine final isActive
    let finalIsActive = existingCenter.isActive;

    if (updateData.isActive !== undefined) {
      // Admin is explicitly changing isActive
      if (updateData.isActive && !finalCoordinatorId) {
        // warn if activation without coordinator
        finalIsActive=false;
        warnings.push('Center auto-deactivated because coordinator was removed');

      }

      if (updateData.isActive && !finalSuperCoordinatorId) {
        // Warn if activating without super
        warnings.push('Center activated without super coordinator - consider assigning one');
      }

      finalIsActive = updateData.isActive;
    } else if (updateData.coordinatorId === null && existingCenter.isActive) {
      // Auto-deactivate only if explicitly removing coordinator from active center
      finalIsActive = false;
      warnings.push('Center auto-deactivated because coordinator was removed');
    }

    // Update center
    const updatedCenter = await prisma.center.update({
      where: { id: centerId },
      data: {
        name: updateData.name,
        area: updateData.area,
        coordinatorId: updateData.coordinatorId,
        superCoordinatorId: updateData.superCoordinatorId,
        location: updateData.location,
        isActive: finalIsActive,
      },
      include: CENTERS_FOR_ADMIN,
    });

    return apiResponse(true, updatedCenter, undefined, 200, warnings.length > 0 ? warnings : undefined);
  } catch (error) {
    console.error('[PUT /api/admin/centers/[id]] Error:', error);

    if (error instanceof z.ZodError) {
      return apiResponse(
        false,
        null,
        { message: 'Invalid request data', details: error.errors },
        400
      );
    }

    // Handle Prisma unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return apiResponse(false, null, { message: 'Center name already exists' }, 400);
    }

    if (error instanceof Error) {
      return apiResponse(false, null, { message: error.message }, 400);
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

/**
 * DELETE /api/admin/centers/[id]
 * Deletes a center and all its game instances
 * Will fail if center has any rentals (FK constraint)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    await assertAdminRole(token);

    const { id: centerId } = await params;

    // Check if center exists
    const center = await prisma.center.findUnique({
      where: { id: centerId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { rentals: true },
        },
      },
    });


    if (!center) {
      return apiResponse(false, null, { message: 'Center not found' }, 404);
    }

    // Check for any rentals
    if (center._count.rentals > 0) {
      return apiResponse(
        false,
        null,
        { message: `Cannot delete center with ${center._count.rentals} rental(s)` },
        400
      );
    }

    // Delete center and all game instances in a transaction
    await prisma.$transaction([
      prisma.gameInstance.deleteMany({
        where: { centerId },
      }),
      prisma.center.delete({
        where: { id: centerId },
      }),
    ]);

    return apiResponse(true, {
      message: 'Center and all game instances deleted successfully',
      centerId: center.id,
      centerName: center.name,
    });
  } catch (error) {
    console.error('[DELETE /api/admin/centers/[id]] Error:', error);

    // Handle foreign key constraint violation (has rentals)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2014' || error.code === 'P2003') {
        return apiResponse(
          false,
          null,
          { message: 'Cannot delete center with existing rentals' },
          400
        );
      }
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}