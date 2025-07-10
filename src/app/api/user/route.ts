import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ExtendedUpdateProfileSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        managedCenterIds: true,
        supervisedCenterIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    return apiResponse(true, user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const validatedData = ExtendedUpdateProfileSchema.parse(body);

    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: token.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        managedCenterIds: true,
        supervisedCenterIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiResponse(true, updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}