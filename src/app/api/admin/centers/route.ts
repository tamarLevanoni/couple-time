import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateCenterSchema, UpdateCenterSchema, IdSchema } from '@/lib/validations';
import { Role } from '@/types/database';

// Use centralized schemas - no extensions needed for basic center management
const createCenterSchema = CreateCenterSchema;
const updateCenterSchema = UpdateCenterSchema.omit({ id: true }).extend({
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const area = searchParams.get('area');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    const where: any = {};

    if (area) {
      where.area = area;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [centers, total] = await Promise.all([
      prisma.center.findMany({
        where,
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
          _count: {
            select: {
              gameInstances: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.center.count({ where }),
    ]);

    return apiResponse(true, {
      centers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching centers:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const body = await req.json();
    const centerData = createCenterSchema.parse(body);

    // Verify coordinators exist and have proper roles
    if (centerData.coordinatorId) {
      const coordinator = await prisma.user.findFirst({
        where: {
          id: centerData.coordinatorId,
          roles: { has: Role.CENTER_COORDINATOR },
          isActive: true,
        },
      });

      if (!coordinator) {
        return apiResponse(false, null, { message: 'Invalid coordinator ID' }, 400);
      }
    }

    if (centerData.superCoordinatorId) {
      const superCoordinator = await prisma.user.findFirst({
        where: {
          id: centerData.superCoordinatorId,
          roles: { has: Role.SUPER_COORDINATOR },
          isActive: true,
        },
      });

      if (!superCoordinator) {
        return apiResponse(false, null, { message: 'Invalid super coordinator ID' }, 400);
      }
    }

    // Create center
    const center = await prisma.center.create({
      data: {
        ...centerData,
        isActive: true,
      },
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

    return apiResponse(true, center);
  } catch (error) {
    console.error('Error creating center:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const centerId = searchParams.get('id');

    if (!centerId) {
      return apiResponse(false, null, { message: 'Center ID is required' }, 400);
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const centerId = searchParams.get('id');

    if (!centerId) {
      return apiResponse(false, null, { message: 'Center ID is required' }, 400);
    }

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