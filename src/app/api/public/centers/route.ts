import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';

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
        }
      }
    });

    return successResponse(centers);

  } catch (error) {
    console.error('Error fetching centers:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המוקדים');
  }
}