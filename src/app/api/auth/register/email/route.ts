import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { RegisterWithEmailSchema } from '@/lib/validations';
import { USER_CONTACT_FIELDS } from '@/types';

export async function OPTIONS() {
  return apiResponse(true, null);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = RegisterWithEmailSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiResponse(false, null, { message: 'משתמש עם כתובת מייל זו כבר קיים במערכת' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
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
    console.error('Email registration error:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'נתונים לא תקינים', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'שגיאה בהרשמה. נסה שוב מאוחר יותר' }, 500);
  }
}