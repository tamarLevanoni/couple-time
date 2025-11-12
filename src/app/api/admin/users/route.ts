import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { CreateUserSchema } from '@/lib/validations';
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

    // Return all users with center assignments - filtering done client-side
    const users = await prisma.user.findMany({
      include: USERS_FOR_ADMIN,
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(true, users);
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

    // Check if email already exists (BLOCK)
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return apiResponse(false, null, { message: 'Email already exists' }, 400);
    }

    const warnings: string[] = [];

    // Check if phone already exists (WARN)
    if (userData.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: userData.phone },
      });

      if (existingPhone) {
        warnings.push('Phone number already exists for another user');
      }
    }

    // Validate role-based center assignments
    const hasCoordinatorRole = userData.roles?.includes('CENTER_COORDINATOR');
    const hasSuperRole = userData.roles?.includes('SUPER_COORDINATOR');
    const isRegularUser = !hasCoordinatorRole && !hasSuperRole && !userData.roles?.includes('ADMIN');

    // BLOCK: Regular user cannot have center assignments
    if (isRegularUser && (userData.managedCenterId || userData.supervisedCenterIds?.length)) {
      return apiResponse(
        false,
        null,
        { message: 'Regular users cannot have center assignments' },
        400
      );
    }

    // WARN: CENTER_COORDINATOR without managedCenterId
    if (hasCoordinatorRole && !userData.managedCenterId) {
      warnings.push('Center coordinator role assigned without a managed center');
    }

    // WARN: SUPER_COORDINATOR without supervisedCenterIds
    if (hasSuperRole && (!userData.supervisedCenterIds || userData.supervisedCenterIds.length === 0)) {
      warnings.push('Super coordinator role assigned without supervised centers');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user with relations
    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        roles: userData.roles || [],
        managedCenterId: hasCoordinatorRole ? userData.managedCenterId : null,
        supervisedCenters: hasSuperRole && userData.supervisedCenterIds?.length
          ? { connect: userData.supervisedCenterIds.map(id => ({ id })) }
          : undefined,
        isActive: true,
      },
      include: USERS_FOR_ADMIN,
    });

    return apiResponse(true, {
      user,
      warnings: warnings.length > 0 ? warnings : undefined,
    }, undefined, 201);
  } catch (error) {
    console.error('Error creating user:', error);

    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }

    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}


