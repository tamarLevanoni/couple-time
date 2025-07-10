import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { CoordinatorUpdateRentalSchema } from '@/lib/validations';

interface AuthToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as AuthToken | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const { status, notes } = CoordinatorUpdateRentalSchema.parse(body);

    const rental = await prisma.rental.findFirst({
      where: { id: params.id },
      include: {
        gameInstance: {
          include: {
            center: true,
            game: true
          }
        }
      }
    });

    if (!rental) {
      return apiResponse(false, null, { message: 'Rental not found' }, 404);
    }

    // Check if coordinator has access to this rental's center
    const hasAccess = rental.gameInstance.center.coordinatorId === token.id ||
                     rental.gameInstance.center.superCoordinatorId === token.id;

    if (!hasAccess) {
      return apiResponse(false, null, { message: 'Access denied to this center' }, 403);
    }

    // Update the rental
    const updatedRental = await prisma.rental.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === 'ACTIVE' && { 
          borrowDate: new Date()
        }),
        ...(status === 'RETURNED' && { 
          returnDate: new Date()
        })
      },
      include: {
        gameInstance: {
          include: {
            game: true,
            center: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Update game instance status if needed
    if (status === 'CANCELLED' || status === 'RETURNED') {
      await prisma.gameInstance.update({
        where: { id: rental.gameInstanceId },
        data: { status: 'AVAILABLE' }
      });
    }

    return apiResponse(true, updatedRental);
  } catch (error) {
    console.error('Error updating rental:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}