import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { hasRole, isAdmin, isCoordinator, isSuperCoordinator } from '@/lib/auth-middleware';

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const checkRole = (requiredRoles: Role[]) => {
    if (!user?.roles) return false;
    return hasRole(user.roles, requiredRoles);
  };

  const checkAdmin = () => {
    if (!user?.roles) return false;
    return isAdmin(user.roles);
  };

  const checkCoordinator = () => {
    if (!user?.roles) return false;
    return isCoordinator(user.roles);
  };

  const checkSuperCoordinator = () => {
    if (!user?.roles) return false;
    return isSuperCoordinator(user.roles);
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    hasRole: checkRole,
    isAdmin: checkAdmin,
    isCoordinator: checkCoordinator,
    isSuperCoordinator: checkSuperCoordinator,
  };
}