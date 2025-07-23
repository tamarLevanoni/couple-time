import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { CompleteGoogleProfileSchema } from '@/lib/validations';
import { Role } from '@prisma/client';
import { USER_CONTACT_FIELDS } from '@/types';
import { getToken, JWT } from 'next-auth/jwt';
import z from 'zod';

export async function OPTIONS() {
  return apiResponse(true, null);
}

export async function PUT(req: NextRequest) {
  try {

    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    const body = await req.json();
    const { firstName, lastName, phone } = CompleteGoogleProfileSchema.parse(body);

    if (!firstName || !lastName || !phone) {
      return apiResponse(false, null, { message: 'Missing fields' }, 400);
    }

    // Check if user already exists by email
    const dbUser = await prisma.user.findUnique({
      where: { id:token.id },
    });

    if (!dbUser) {
      return apiResponse(false, null, { message: 'משתמש לא נמצא' }, 400);
    }


    // Update user with Google OAuth
    const user = await prisma.user.update({
      where: { id: token.id },
      data: {
        firstName,
        lastName,
        phone,
        isActive: true,
      },
      select: USER_CONTACT_FIELDS,
    });

    return apiResponse(true, user, undefined, 201);
  } catch (error) {
    console.error('Complete Google profile error:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'נתונים לא תקינים', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'שגיאה בהשלמת הפרופיל. נסה שוב מאוחר יותר' }, 500);
  }
}