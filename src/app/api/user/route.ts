import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateUserProfileSchema } from '@/lib/validations';
import { USER_CONTACT_FIELDS, RENTAL_FOR_USER, USER_WITH_ACTIVE_RENTALS } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      include: USER_WITH_ACTIVE_RENTALS,
    });

    if (!user) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Create UserProfileWithRentals response
    const userProfile = {
      ...user,
      currentRentals: user.rentals,
    };

    return apiResponse(true, userProfile);
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
    const updateData = UpdateUserProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: token.id },
      data: updateData,
      select: USER_CONTACT_FIELDS,
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