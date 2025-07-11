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

    // Find the rental and verify access through supervised centers
    const rental = await prisma.rental.findFirst({
      where: {
        id,
        gameInstances: {
          every: {
            center: {
              superCoordinatorId: token.id,
            },
          },
        },
      },
      include: {
        gameInstances: {
          include: {
            center: true,
            game: true,
          },
        },
      },
    });

    if (!rental) {
      return apiResponse(false, null, { message: 'Rental not found or access denied' }, 404);
    }

    // Update the rental
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // Add timestamps based on status
      if (status === 'ACTIVE') {
        updateData.borrowDate = new Date();
      } else if (status === 'RETURNED') {
        updateData.returnDate = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    

    const updatedRental = await prisma.rental.update({
      where: { id },
      data: updateData,
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
            phone: true,
          },
        },
      },
    });

    // Update game instance statuses if needed
    if (status === 'CANCELLED' || status === 'RETURNED') {
      await prisma.gameInstance.updateMany({
        where: { 
          id: { in: rental.gameInstances.map(gi => gi.id) },
        },
        data: { status: 'AVAILABLE' },
      });
    } else if (status === 'ACTIVE') {
      await prisma.gameInstance.updateMany({
        where: { 
          id: { in: rental.gameInstances.map(gi => gi.id) },
        },
        data: { status: 'BORROWED' },
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