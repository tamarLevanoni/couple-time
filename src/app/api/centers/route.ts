import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { Area } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area') as Area | null;
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true // Only show active centers
    };
    
    if (area) {
      where.area = area;
    }
    
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get centers with game counts and coordinator info
    const [centers, total] = await Promise.all([
      prisma.center.findMany({
        where,
        skip,
        take: limit,
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
          _count: {
            select: { 
              gameInstances: true
            }
          }
        }
      }),
      prisma.center.count({ where })
    ]);

    // Get active rentals count for all centers efficiently
    const centerIds = centers.map(c => c.id);
    const activeRentalsData = await prisma.rental.findMany({
      where: {
        status: 'ACTIVE',
        gameInstance: {
          centerId: { in: centerIds }
        }
      },
      select: {
        gameInstance: {
          select: {
            centerId: true
          }
        }
      }
    });

    // Create a map of centerId to active rentals count
    const rentalsMap = new Map<string, number>();
    activeRentalsData.forEach(rental => {
      const centerId = rental.gameInstance.centerId;
      rentalsMap.set(centerId, (rentalsMap.get(centerId) || 0) + 1);
    });

    // Transform response
    const centersWithStats = centers.map(center => ({
      id: center.id,
      name: center.name,
      city: center.city,
      area: center.area,
      location: center.location,
      coordinator: center.coordinator,
      superCoordinator: center.superCoordinator,
      stats: {
        totalGames: center._count.gameInstances,
        activeRentals: rentalsMap.get(center.id) || 0
      },
      isActive: center.isActive,
      createdAt: center.createdAt,
      updatedAt: center.updatedAt
    }));

    return successResponse(centersWithStats, {
      page,
      limit,
      total,
      hasNext: skip + limit < total,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Error fetching centers:', error);
    return errorResponse('INTERNAL_ERROR', 'שגיאה בטעינת המוקדים');
  }
}