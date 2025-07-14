import { NextRequest } from 'next/server';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { LoginWithEmailSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

// CORS is now handled globally in middleware.ts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = LoginWithEmailSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return Response.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({ 
        error: 'Account is not active' 
      }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
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
      name: user.name,
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
        name: user.name,
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