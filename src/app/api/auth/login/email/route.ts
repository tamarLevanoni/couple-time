import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { LoginWithEmailSchema } from '@/lib/validations';
import { USER_CONTACT_FIELDS, USER_WITH_ACTIVE_RENTALS } from '@/types';

export async function OPTIONS() {
  return apiResponse(true, null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginWithEmailSchema.parse(body);

    // Find user by email with active rentals
    const user = await prisma.user.findUnique({
      where: { email },
      include: USER_WITH_ACTIVE_RENTALS,
    });

    if (!user) {
      return apiResponse(false, null, { message: 'כתובת מייל או סיסמה שגויים' }, 401);
    }

    if (!user.isActive) {
      return apiResponse(false, null, { message: 'חשבון המשתמש אינו פעיל' }, 403);
    }

    if (!user.password) {
      return apiResponse(false, null, { message: 'חשבון זה לא נוצר עם סיסמה. נסה להתחבר עם Google' }, 400);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return apiResponse(false, null, { message: 'כתובת מייל או סיסמה שגויים' }, 401);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return apiResponse(true, userWithoutPassword);
  } catch (error) {
    console.error('Email login error:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'נתונים לא תקינים', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'שגיאה בכניסה. נסה שוב מאוחר יותר' }, 500);
  }
}