import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validations';
import { USERS_FOR_ADMIN } from '@/types/models';
import { assertAdminRole } from '@/lib/permissions';


export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const offset = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.roles = { has: role };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // By default, only show active users unless explicitly requested
    if (!includeInactive) {
      where.isActive = true;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: USERS_FOR_ADMIN,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return apiResponse(true, {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    await assertAdminRole(token);

    const body = await req.json();
    const userData = CreateUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return apiResponse(false, null, { message: 'Email already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        isActive: true,
      },
      include: USERS_FOR_ADMIN,
    });

    return apiResponse(true, user, undefined, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // Verify user is an admin
    if (!token.roles?.includes('ADMIN')) {
      return apiResponse(false, null, { message: 'Access forbidden - admin role required' }, 403);
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return apiResponse(false, null, { message: 'User ID is required' }, 400);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // Check for active rentals
    const activeRentals = await prisma.rental.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (activeRentals.length > 0) {
      return apiResponse(false, null, { message: 'Cannot delete user with active rentals' }, 400);
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return apiResponse(true, { message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}