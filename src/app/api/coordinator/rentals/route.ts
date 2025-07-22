import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { CreateManualRentalInput, CreateManualRentalSchema, RentalStatusSchema } from '@/lib/validations';
import { RENTAL_FOR_COORDINATOR } from '@/types/models';
import { AccessDeniedError, ResourceNotFoundError } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  try {
    // 1. Auth - Extract user from JWT token
    const token = await getToken({ req });
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    const { searchParams } = new URL(req.url);
    
    // Parse filters from query parameters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build where clause with coordinator access and filters
    const whereClause: any = {
      center: {
        coordinatorId: token.id,
      },
    };

    // Add status filter if provided
    if (status && RentalStatusSchema.safeParse(status).success) {
      whereClause.status = status;
    }

    // Add search filter if provided (search in user name or notes)
    if (search) {
      whereClause.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          notes: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Single query with embedded access control
    const rentals = await prisma.rental.findMany({
      where: whereClause,
      include: RENTAL_FOR_COORDINATOR,
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(true, rentals);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return apiResponse(false, null, { message: error.message }, 404);
    }
    if (error instanceof AccessDeniedError) {
      return apiResponse(false, null, { message: error.message }, 403);
    }
    return apiResponse(false, null, { message: 'Server error' }, 500);
  }
}

async function validateRentalCreation(data: CreateManualRentalInput, coordinatorId: string) {
  // Single query to validate game instances and check availability
  const gameInstances = await prisma.gameInstance.findMany({
    where: {
      id: { in: data.gameInstanceIds },
      centerId: data.centerId,
      center: {
        coordinatorId,
      },
      status: 'AVAILABLE',
    },
    select: { id: true, centerId: true },
  });

  if (gameInstances.length !== data.gameInstanceIds.length) {
    throw new ResourceNotFoundError('One or more game instances not found or not available at your centers');
  }

  // Single query to check user exists and existing rentals
  const user = await prisma.user.findFirst({
    where: { id: data.userId },
    select: {
      id: true,
      rentals: {
        where: {
          status: { in: ['ACTIVE', 'PENDING'] },
          gameInstances: {
            some: {
              id: { in: data.gameInstanceIds }
            }
          }
        },
        select: { id: true }
      }
    }
  });

  if (!user) {
    throw new ResourceNotFoundError('User not found');
  }

  if (user.rentals.length > 0) {
    throw new Error('User already has a pending or active rental for one or more of these games');
  }

  return;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth - Extract user from JWT token
    const token = await getToken({ req });
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    // 2. Validation - Parse and validate request body
    const data = CreateManualRentalSchema.parse(await req.json());

    // 3. Resource validation with single queries
    await validateRentalCreation(data, token.id);

    // 4. Create rental with transaction
    const rental = await prisma.$transaction(async (tx) => {
      // Create rental in ACTIVE status (manual rental by coordinator)
      const newRental = await tx.rental.create({
        data: {
          userId: data.userId,
          centerId: data.centerId,
          status: 'ACTIVE',
          borrowDate: data.borrowDate,
          expectedReturnDate: data.expectedReturnDate,
          notes: data.notes,
          gameInstances: {
            connect: data.gameInstanceIds.map(id => ({ id })),
          },
        },
        include: RENTAL_FOR_COORDINATOR,
      });

      // Update game instances to BORROWED status
      await tx.gameInstance.updateMany({
        where: { id: { in: data.gameInstanceIds } },
        data: { status: 'BORROWED' },
      });

      return newRental;
    });

    return apiResponse(true, rental, undefined, 201);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return apiResponse(false, null, { message: error.message }, 404);
    }
    if (error instanceof AccessDeniedError) {
      return apiResponse(false, null, { message: error.message }, 403);
    }
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data' }, 400);
    }
    if (error instanceof Error && error.message.includes('User already has')) {
      return apiResponse(false, null, { message: error.message }, 400);
    }
    
    return apiResponse(false, null, { message: 'Server error' }, 500);
  }
}