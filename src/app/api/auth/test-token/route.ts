import { NextRequest } from 'next/server';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { LoginWithEmailSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

// CORS is now handled globally in middleware.ts

export async function POST(req: NextRequest) {
  try {

    if (process.env.NODE_ENV !== 'development') {
      return new Response('Not allowed in production', { status: 403 });
    }
    const body = await req.json();
    const { email } = body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }


    // Generate JWT token using NextAuth's encode function
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not configured');
    }

    const tokenPayload = {
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
      roles: user.roles,
    };

    const token = await encode({
      token: tokenPayload,
      secret,
    });

    return Response.json({ 
      token,
      usage: 'Use this token in Swagger UI Authorization header as: Bearer <token>',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Error generating test token:', error);
    return Response.json({ 
      error: 'Failed to generate token' 
    }, { status: 500 });
  }
}