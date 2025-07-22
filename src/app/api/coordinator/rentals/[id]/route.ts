import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { UpdateRentalByCoordinatorSchema } from '@/lib/validations';
import { RENTAL_FOR_COORDINATOR } from '@/types/models';
import { RentalStatus } from '@prisma/client';
import { assertRentalAccess, AccessDeniedError, ResourceNotFoundError } from '@/lib/permissions';

function determineStatusFromDates(data: any) {
  if (data.returnDate) {
    return 'RETURNED';
  } else if (data.borrowDate) {
    return 'ACTIVE';
  }
  return data.status;
}

async function validateAndUpdateRental(rentalId: string, data: any, coordinatorId: string) {
  // Validate game instance update if requested
  if (data.gameInstanceIds) {
    const rental = await prisma.rental.findFirst({
      where: { id: rentalId },
      select: { status: true },
    });

    if (!rental) {
      throw new ResourceNotFoundError('Rental not found');
    }

    if (rental.status !== RentalStatus.PENDING) {
      throw new Error('Game instances can only be updated for PENDING rentals');
    }
  }

  const updateData = {
    ...data,
    status: determineStatusFromDates(data)
  };

  // Build where clause for conditional updates
  const whereClause: any = { id: rentalId };
  if (updateData.status === 'CANCELLED') {
    whereClause.status = RentalStatus.PENDING;
  }

  // Prepare update data
  const { gameInstanceIds, ...rentalData } = updateData;
  const finalUpdateData: any = { ...rentalData };
  
  if (gameInstanceIds) {
    finalUpdateData.gameInstances = {
      set: [],
      connect: gameInstanceIds.map((id: string) => ({ id }))
    };
  }

  return { whereClause, finalUpdateData, gameInstanceIds };
}

async function updateGameInstanceStatuses(rental: any) {
  if (!rental.status) return;

  const gameInstanceIds = rental.gameInstances.map((gi: any) => gi.id);
  
  if (rental.status === 'CANCELLED' || rental.status === 'RETURNED') {
    await prisma.gameInstance.updateMany({
      where: { id: { in: gameInstanceIds } },
      data: { status: 'AVAILABLE' },
    });
  } else if (rental.status === 'ACTIVE') {
    await prisma.gameInstance.updateMany({
      where: { id: { in: gameInstanceIds } },
      data: { status: 'BORROWED' },
    });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Auth - Extract user from JWT token
    const token = await getToken({ req });
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    // 2. Validation - Parse and validate request body
    const data = UpdateRentalByCoordinatorSchema.parse(await req.json());
    const { id: rentalId } = await params;

    // 3. Resource access - Use route-specific access level
    await assertRentalAccess(rentalId, token, 'coordinator');

    // 4. Validate and prepare update data
    const { whereClause, finalUpdateData } = await validateAndUpdateRental(rentalId, data, token.id);

    // 5. Single transaction for rental update and game instance status changes
    const updatedRental = await prisma.$transaction(async (tx) => {
      const rental = await tx.rental.update({
        where: whereClause,
        data: finalUpdateData,
        include: RENTAL_FOR_COORDINATOR,
      });

      // Update game instance statuses based on rental status
      await updateGameInstanceStatuses(rental);

      return rental;
    });

    return apiResponse(true, updatedRental);
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
    if (error instanceof Error && error.message.includes('Game instances can only be updated')) {
      return apiResponse(false, null, { message: error.message }, 400);
    }
    
    return apiResponse(false, null, { message: 'Server error' }, 500);
  }
}