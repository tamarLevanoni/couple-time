import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { USER_CONTACT_FIELDS } from '@/types';
import { getToken, JWT } from 'next-auth/jwt';

const CompleteGoogleProfileSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\d\-\+\(\)\s]+$/, 'Invalid phone format').min(9).max(15),
});

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
    const { name, phone } =body;
    // const { googleId, name, email, phone } = CompleteGoogleProfileSchema.parse(body);

    if (!name || !phone) {
      return apiResponse( false,null,{ message:'Missing fields' }, 400);
    }

    // Check if user already exists by email
    const dbUser = await prisma.user.findUnique({
      where: { id:token.id },
    });

    if (!dbUser) {
      return apiResponse(false, null, { message: 'משתמש לא נמצא' }, 400);
    }


    // Create user with Google OAuth
    const user = await prisma.user.update({
      where:{id:token.id},
      data: {
        name,
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