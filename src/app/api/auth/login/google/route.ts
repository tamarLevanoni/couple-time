import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { LoginWithGoogleSchema } from '@/lib/validations';
import { USER_CONTACT_FIELDS, USER_WITH_ACTIVE_RENTALS } from '@/types';

export async function OPTIONS() {
  return apiResponse(true, null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { googleId } = LoginWithGoogleSchema.parse(body);

    // Find user by Google ID with active rentals
    const user = await prisma.user.findUnique({
      where: { googleId },
      include: USER_WITH_ACTIVE_RENTALS,
    });

    if (!user) {
      return apiResponse(false, null, { message: 'חשבון Google זה לא רשום במערכת' }, 404);
    }

    if (!user.isActive) {
      return apiResponse(false, null, { message: 'חשבון המשתמש אינו פעיל' }, 403);
    }

    return apiResponse(true, user);
  } catch (error) {
    console.error('Google login error:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'נתונים לא תקינים', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'שגיאה בכניסה עם Google. נסה שוב מאוחר יותר' }, 500);
  }
}