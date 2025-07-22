import { NextRequest } from 'next/server';
import { getToken, JWT } from 'next-auth/jwt';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { COORDINATOR_DASHBOARD } from '@/types/models';
import type { CoordinatorDashboard } from '@/types/computed';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req }) as JWT | null;
    if (!token) {
      return apiResponse(false, null, { message: 'Authentication required' }, 401);
    }
    
    
    const userId = token.id;
    
    // Find the center this user coordinates
    const center = await prisma.center.findFirst({
      where: {
        coordinatorId: userId,
        isActive: true,
      },
      include: COORDINATOR_DASHBOARD,
    });

    if (!center) {
      return apiResponse(false, null, { message: 'No center found for this coordinator' }, 404);
    }

    // Separate rentals by status
    const pendingRentals = center.rentals.filter(rental => rental.status === 'PENDING');
    const activeRentals = center.rentals.filter(rental => rental.status === 'ACTIVE');

    // Create dashboard response
    const dashboard: CoordinatorDashboard = {
      center: {
        id: center.id,
        name: center.name,
        city: center.city,
        area: center.area,
      },
      superCoordinator: center.superCoordinator || undefined,
      pendingRentals,
      activeRentals,
    };

    return apiResponse(true, dashboard);
  } catch (error) {
    console.error('Error fetching coordinator dashboard:', error);
    return apiResponse(false, null, { message: 'Internal server error' }, 500);
  }
}