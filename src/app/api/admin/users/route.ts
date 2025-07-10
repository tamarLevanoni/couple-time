import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validations';

// Extend the base schemas for admin-specific needs
const createUserSchema = CreateUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const updateUserSchema = UpdateUserSchema.omit({ id: true }).extend({
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roles: true,
          managedCenterIds: true,
          supervisedCenterIds: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
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

    const body = await req.json();
    const userData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return apiResponse(false, null, { message: 'Email already exists' }, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        managedCenterIds: true,
        supervisedCenterIds: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiResponse(true, user);
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return apiResponse(false, null, { message: 'User ID is required' }, 400);
    }

    const body = await req.json();
    const updateData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return apiResponse(false, null, { message: 'User not found' }, 404);
    }

    // If updating email, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return apiResponse(false, null, { message: 'Email already exists' }, 400);
      }
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: cleanUpdateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        managedCenterIds: true,
        supervisedCenterIds: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiResponse(true, updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
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