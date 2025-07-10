import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const centers = await prisma.center.findMany({
      where: {
        isActive: true
      },
      orderBy: { name: 'asc' },
      include: {
        coordinator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        superCoordinator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        gameInstances: {
          select: {
            id: true,
            status: true,
            game: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    return apiResponse(true, centers);

  } catch (error) {
    console.error('Error fetching centers:', error);
    return apiResponse(false, null, { message: 'Error fetching centers' }, 500);
  }
}