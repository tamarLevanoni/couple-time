import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { OptionalPhoneSchema } from '@/lib/validations';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: OptionalPhoneSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  preferredLanguage: z.enum(['he', 'en']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
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
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

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