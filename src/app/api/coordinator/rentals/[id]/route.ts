import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { z } from 'zod';
import { UpdateRentalSchema } from '@/lib/validations';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    const body = await req.json();
    const { status, notes } = UpdateRentalSchema.parse(body);

    const rental = await prisma.rental.findFirst({
      where: { id: params.id },
      include: {
        gameInstances: {
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

    // Check if coordinator has access to this rental's centers
    const hasAccess = rental.gameInstances.every(gi => 
      gi.center.coordinatorId === token.id || gi.center.superCoordinatorId === token.id
    );

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
        gameInstances: {
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

    // Update game instance statuses if needed
    if (status === 'CANCELLED' || status === 'RETURNED') {
      await prisma.gameInstance.updateMany({
        where: { 
          id: { in: rental.gameInstances.map(gi => gi.id) },
        },
        data: { status: 'AVAILABLE' }
      });
    } else if (status === 'ACTIVE') {
      await prisma.gameInstance.updateMany({
        where: { 
          id: { in: rental.gameInstances.map(gi => gi.id) },
        },
        data: { status: 'BORROWED' }
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