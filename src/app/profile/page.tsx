'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading';
import { Shield } from '@/components/icons';
import { UserProfileCard, RentalStatistics, QuickActions, UserInfo } from '@/components/profile';
import { 
  useUserStore, 
  useUserProfile, 
  useUserRoles, 
  useHasPrivilegedRole, 
  useUserManagedCenter, 
  useRentalsStore,
  useFilteredUserRentals,
  useRentalCounts,
  useCentersStore,
  useGamesStore,
  useGameById,
  useCenterById
} from '@/store';


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading, updateProfile, error } = useUserStore();
  const { loadUserRentals } = useRentalsStore();
  
  // User data hooks
  const userProfile = useUserProfile();
  const userRoles = useUserRoles();
  const hasPrivilegedRole = useHasPrivilegedRole();
  const managedCenterId = useUserManagedCenter();
  const managedCenter = useCenterById(managedCenterId || undefined);
  
  // Use proper rental data from rentals store instead of user store
  const allUserRentals = useFilteredUserRentals();
  const activeRentals = allUserRentals.filter(rental => rental.status === 'ACTIVE');
  const rentalCounts = useRentalCounts();
  
  
  // Load data for statistics
  useEffect(() => {
    if (session) {
      loadUserRentals();
    }
  }, [session, loadUserRentals]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      return;
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return <LoadingPage title="טוען פרטי משתמש..." />;
  }

  if (!session) {
    return null;
  }


  return (
    
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            הפרטים שלי
          </h1>
          <p className="text-lg text-gray-600">
            נהלו את פרטי החשבון שלכם
          </p>
        </div>

        {/* User Role Badge */}
        {hasPrivilegedRole && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 ml-2" />
              <span className="text-blue-800 font-medium">
                {userRoles.includes('ADMIN') && 'מנהל מערכת'}
                {userRoles.includes('SUPER_COORDINATOR') && !userRoles.includes('ADMIN') && 'רכז-על'}
                {userRoles.includes('CENTER_COORDINATOR') && !userRoles.includes('SUPER_COORDINATOR') && !userRoles.includes('ADMIN') && 'רכז מוקד'}
                {managedCenter && ` • ${managedCenter.name}`}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfileCard 
              userProfile={userProfile}
              onUpdateProfile={updateProfile}
              error={error}
            />
            
            <RentalStatistics 
              rentalCounts={rentalCounts}
              activeRentals={activeRentals}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <QuickActions 
              activeRentalCount={rentalCounts.active}
              hasPrivilegedRole={hasPrivilegedRole}
            />

            <UserInfo 
              userProfile={userProfile}
              userRoles={userRoles}
              managedCenter={managedCenter}
            />
          </div>
        </div>
    </div>
    
  );
}