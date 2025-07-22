import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiResponse } from '@/lib/api-response';
import { CENTER_PUBLIC_INFO, type CenterPublicInfo } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const centers = await prisma.center.findMany({
      where: {
        isActive: true
      },
      orderBy: { name: 'asc' },
      select: CENTER_PUBLIC_INFO,
    });

    return apiResponse(true, centers);

  } catch (error) {
    console.error('Error fetching public centers:', error);
    return apiResponse(false, null, { message: 'שגיאה בטעינת המרכזים' }, 500);
  }
}