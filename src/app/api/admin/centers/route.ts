import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateCenterSchema, UpdateCenterSchema, IdParamSchema } from '@/lib/validations';
import { Role } from '@/types/schema';
import { assertAdminRole } from '@/lib/permissions';

// Use centralized schemas - already include all needed fields
const createCenterSchema = CreateCenterSchema;
const updateCenterSchema = UpdateCenterSchema;

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const area = searchParams.get('area');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';
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

    // By default, only show active centers unless explicitly requested
    if (!includeInactive) {
      where.isActive = true;
    }

    const [centers, total] = await Promise.all([
      prisma.center.findMany({
        where,
        include: {
          coordinator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          superCoordinator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
    
    // Verify user is an admin
    await assertAdminRole(token);

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
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        superCoordinator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return apiResponse(true, center, undefined, 201);
  } catch (error) {
    console.error('Error creating center:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

