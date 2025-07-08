import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { Role } from '@prisma/client';

export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
  requiredRoles?: Role[]
) {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'נדרשת הזדהות' },
          { status: 401 }
        );
      }

      if (!session.user.isActive) {
        return NextResponse.json(
          { error: 'החשבון לא פעיל' },
          { status: 403 }
        );
      }

      // Check if user has required roles
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role =>
          session.user.roles.includes(role)
        );

        if (!hasRequiredRole) {
          return NextResponse.json(
            { error: 'אין הרשאה לפעולה זו' },
            { status: 403 }
          );
        }
      }

      return handler(req, session);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'שגיאת הזדהות' },
        { status: 500 }
      );
    }
  };
}

// Helper function to check if user can manage a specific center
export function canManageCenter(session: any, centerId: string): boolean {
  if (!session?.user) return false;
  
  const user = session.user;
  
  // Admins can manage all centers
  if (user.roles.includes(Role.ADMIN)) return true;
  
  // Check if user manages this center directly
  if (user.managedCenterIds.includes(centerId)) return true;
  
  // Check if super coordinator supervises this center
  if (user.supervisedCenterIds.includes(centerId)) return true;
  
  return false;
}

// Helper function to get accessible center IDs for a user
export function getAccessibleCenterIds(session: any): string[] {
  if (!session?.user) return [];
  
  const user = session.user;
  
  // Admins can access all centers - return empty array to indicate "all"
  if (user.roles.includes(Role.ADMIN)) return [];
  
  // Combine managed and supervised centers
  return [...user.managedCenterIds, ...user.supervisedCenterIds];
}