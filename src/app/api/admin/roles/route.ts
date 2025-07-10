import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { AssignRoleSchema } from '@/lib/validations';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const body = await req.json();
    const roleData = AssignRoleSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: roleData.userId },
    });

    if (!existingUser) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Validate center IDs if provided
    if (roleData.managedCenterIds && roleData.managedCenterIds.length > 0) {
      const centerCount = await prisma.center.count({
        where: {
          id: { in: roleData.managedCenterIds },
          isActive: true,
        },
      });

      if (centerCount !== roleData.managedCenterIds.length) {
        return apiResponse(false, null, { message: 'One or more managed center IDs are invalid' }, 400);
      }
    }

    if (roleData.supervisedCenterIds && roleData.supervisedCenterIds.length > 0) {
      const centerCount = await prisma.center.count({
        where: {
          id: { in: roleData.supervisedCenterIds },
          isActive: true,
        },
      });

      if (centerCount !== roleData.supervisedCenterIds.length) {
        return apiResponse(false, null, { message: 'One or more supervised center IDs are invalid' }, 400);
      }
    }

    // Update user roles and center assignments
    const updatedUser = await prisma.user.update({
      where: { id: roleData.userId },
      data: {
        roles: roleData.roles,
        managedCenterIds: roleData.managedCenterIds || [],
        supervisedCenterIds: roleData.supervisedCenterIds || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        managedCenterIds: true,
        supervisedCenterIds: true,
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