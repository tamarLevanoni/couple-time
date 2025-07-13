import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { RegisterWithGoogleSchema } from '@/lib/validations';
import { USER_CONTACT_FIELDS } from '@/types';

export async function OPTIONS() {
  return apiResponse(true, null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { googleId, name, email, phone } = RegisterWithGoogleSchema.parse(body);

    // Check if user already exists by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return apiResponse(false, null, { message: 'משתמש עם כתובת מייל זו כבר קיים במערכת' }, 400);
    }

    // Check if user already exists by Google ID
    const existingUserByGoogle = await prisma.user.findUnique({
      where: { googleId },
    });

    if (existingUserByGoogle) {
      return apiResponse(false, null, { message: 'חשבון Google זה כבר רשום במערכת' }, 400);
    }

    // Create user with Google OAuth
    const user = await prisma.user.create({
      data: {
        googleId,
        email,
        name,
        phone,
        roles: [Role.USER],
        managedCenterId: null,
        isActive: true,
      },
      select: USER_CONTACT_FIELDS,
    });

    return apiResponse(true, user);
  } catch (error) {
    console.error('Google registration error:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'נתונים לא תקינים', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'שגיאה בהרשמה עם Google. נסה שוב מאוחר יותר' }, 500);
  }
}