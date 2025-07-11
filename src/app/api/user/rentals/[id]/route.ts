import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateRentalSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const { id } = params;
    const body = await req.json();
    const { status, notes } = UpdateRentalSchema.parse(body);

    // Find the rental and verify ownership
    const rental = await prisma.rental.findFirst({
      where: {
        id,
        userId: token.id,
      },
      include: {
        gameInstances: {
          include: {
            game: true,
            center: true,
          },
        },
      },
    });

    if (!rental) {
      return apiResponse(false, null, { message: 'Rental not found' }, 404);
    }

    // Check if rental can be updated
    if (status && status === 'CANCELLED' && rental.status !== 'PENDING') {
      return apiResponse(false, null, { message: 'Only pending rentals can be cancelled' }, 400);
    }

    // Update rental
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
      },
      include: {
        gameInstances: {
          include: {
            game: true,
            center: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return apiResponse(true, updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}
