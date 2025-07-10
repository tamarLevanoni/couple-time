import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { UpdateCenterSchema } from '@/lib/validations';
import { Role } from '@/types/database';

const updateCenterSchema = UpdateCenterSchema.omit({ id: true });

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { id } = params;

    // Find center this user supervises
    const center = await prisma.center.findFirst({
      where: {
        id,
        superCoordinatorId: token.id,
        isActive: true,
      },
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        gameInstances: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                category: true,
                targetAudience: true,
              },
            },
            rentals: {
              where: {
                status: { in: ['PENDING', 'ACTIVE'] },
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!center) {
      return apiResponse(false, null, { message: 'Center not found or access denied' }, 404);
    }

    // Process data for better structure
    const allRentals = center.gameInstances.flatMap(instance => 
      instance.rentals.map(rental => ({
        ...rental,
        gameInstance: {
          id: instance.id,
          status: instance.status,
          game: instance.game,
        },
      }))
    );

    const processedCenter = {
      id: center.id,
      name: center.name,
      city: center.city,
      area: center.area,
      isActive: center.isActive,
      coordinator: center.coordinator,
      gameInstances: center.gameInstances.map(instance => ({
        id: instance.id,
        status: instance.status,
        notes: instance.notes,
        game: instance.game,
        activeRentalsCount: instance.rentals.length,
      })),
      rentals: allRentals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      statistics: {
        totalGames: center.gameInstances.length,
        availableGames: center.gameInstances.filter(g => g.status === 'AVAILABLE').length,
        borrowedGames: center.gameInstances.filter(g => g.status === 'BORROWED').length,
        unavailableGames: center.gameInstances.filter(g => g.status === 'UNAVAILABLE').length,
        pendingRentals: allRentals.filter(r => r.status === 'PENDING').length,
        activeRentals: allRentals.filter(r => r.status === 'ACTIVE').length,
      },
    };

    return apiResponse(true, processedCenter);
  } catch (error) {
    console.error('Error fetching center details:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }

    const { id } = params;
    const body = await req.json();
    const updateData = updateCenterSchema.parse(body);

    // Verify the super coordinator has access to this center
    const center = await prisma.center.findFirst({
      where: {
        id,
        superCoordinatorId: token.id,
        isActive: true,
      },
    });

    if (!center) {
      return apiResponse(false, null, { message: 'Center not found or access denied' }, 404);
    }

    // If updating coordinator, verify the new coordinator exists and is a coordinator
    if (updateData.coordinatorId) {
      const coordinator = await prisma.user.findFirst({
        where: {
          id: updateData.coordinatorId,
          roles: { has: Role.CENTER_COORDINATOR },
          isActive: true,
        },
      });

      if (!coordinator) {
        return apiResponse(false, null, { message: 'Invalid coordinator ID' }, 400);
      }
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      return apiResponse(false, null, { message: 'No valid fields to update' }, 400);
    }

    // Update center
    const updatedCenter = await prisma.center.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return apiResponse(true, updatedCenter);
  } catch (error) {
    console.error('Error updating center:', error);
    
    if (error instanceof z.ZodError) {
      return apiResponse(false, null, { message: 'Invalid request data', details: error.errors }, 400);
    }
    
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}