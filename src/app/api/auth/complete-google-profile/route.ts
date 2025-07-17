import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { USER_CONTACT_FIELDS } from '@/types';

const CompleteGoogleProfileSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\d\-\+\(\)\s]+$/, 'Invalid phone format').min(9).max(15),
});

export async function OPTIONS() {
  return apiResponse(true, null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { googleId, name, email, phone } = CompleteGoogleProfileSchema.parse(body);

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
        managedCenterId: null,
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