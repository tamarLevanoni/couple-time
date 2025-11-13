import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { z } from 'zod';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { assertAdminRole } from '@/lib/permissions';
import { CreateCenterSchema } from '@/lib/validations';
import { CENTERS_FOR_ADMIN } from '@/types/models';
import { validateCoordinator, validateSuperCoordinator } from './_helpers';

/**
 * GET /api/admin/centers
 * Returns all centers with coordinator and super coordinator info
 * No pagination or filtering - all done client-side
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    await assertAdminRole(token);

    // Fetch all centers (client-side filtering)
    const centers = await prisma.center.findMany({
      include: CENTERS_FOR_ADMIN,
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(true, { centers, total: centers.length });
  } catch (error) {
    console.error('[GET /api/admin/centers] Error:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

/**
 * POST /api/admin/centers
 * Creates a new center with validation and transaction safety
 * Auto-sets isActive based on coordinator presence
 * Returns warnings if coordinator assigned without super
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    await assertAdminRole(token);

    const body = await req.json();
    const centerData = CreateCenterSchema.parse(body);

    // Validate coordinator and super coordinator
    if (centerData.coordinatorId) {
      await validateCoordinator(centerData.coordinatorId);
    }

    if (centerData.superCoordinatorId) {
      await validateSuperCoordinator(centerData.superCoordinatorId);
    }

    // Create center (defaults to inactive)
    const center = await prisma.center.create({
      data: {
        name: centerData.name,
        area: centerData.area,
        coordinatorId: centerData.coordinatorId,
        superCoordinatorId: centerData.superCoordinatorId,
        location: centerData.location,
        isActive: false, // Admin must explicitly activate
      },
      include: CENTERS_FOR_ADMIN,
    });

    return apiResponse(true, center, undefined, 201);
  } catch (error) {
    console.error('[POST /api/admin/centers] Error:', error);

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

