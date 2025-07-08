'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Role } from '@prisma/client';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role[];
  requiredCenterAccess?: string; // Center ID for center-specific access
  fallbackPath?: string;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles, 
  requiredCenterAccess,
  fallbackPath = '/auth/signin',
  loadingComponent = <div className="flex items-center justify-center min-h-screen"><div className="text-lg">טוען...</div></div>
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.replace(fallbackPath);
      return;
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = session.user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        router.replace('/unauthorized');
        return;
      }
    }

    // Check center access requirements
    if (requiredCenterAccess) {
      const managedCenters = session.user.managedCenterIds || [];
      const supervisedCenters = session.user.supervisedCenterIds || [];
      const hasAccess = managedCenters.includes(requiredCenterAccess) || 
                       supervisedCenters.includes(requiredCenterAccess) ||
                       session.user.roles?.includes('ADMIN');
      
      if (!hasAccess) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [session, status, requiredRoles, requiredCenterAccess, router, fallbackPath]);

  if (status === 'loading') {
    return <>{loadingComponent}</>;
  }

  if (!session) {
    return null; // Will redirect
  }

  // Check permissions again before rendering
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = session.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return null; // Will redirect
    }
  }

  if (requiredCenterAccess) {
    const managedCenters = session.user.managedCenterIds || [];
    const supervisedCenters = session.user.supervisedCenterIds || [];
    const hasAccess = managedCenters.includes(requiredCenterAccess) || 
                     supervisedCenters.includes(requiredCenterAccess) ||
                     session.user.roles?.includes('ADMIN');
    if (!hasAccess) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}