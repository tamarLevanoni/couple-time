import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { UpdateProfileSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        createdAt: true
      }
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const body = await request.json();
    const { name, phone } = UpdateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        isActive: true,
        createdAt: true
      }
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