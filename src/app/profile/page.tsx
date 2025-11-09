'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading';
import { Shield, AlertCircle } from '@/components/icons';
import { UserProfileCard, QuickActions, UserInfo } from '@/components/profile';
import { MyRentalsContent } from '@/components/rentals/my-rentals-content';
import {
  useUserStore,
  useUserProfile,
  useUserRoles,
  useHasPrivilegedRole,
  useUserManagedCenter,
  useRentalCounts,
  useCenterById,
  useRentalsStore
} from '@/store';


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading, updateProfile, error } = useUserStore();

  // User data hooks
  const userProfile = useUserProfile();
  const userRoles = useUserRoles();
  const hasPrivilegedRole = useHasPrivilegedRole();
  const managedCenterId = useUserManagedCenter();
  const managedCenter = useCenterById(managedCenterId || undefined);

  // Use proper rental data from rentals store instead of user store
  const rentalCounts = useRentalCounts();

  // Load rentals data when user is authenticated
  useEffect(() => {
    if (session?.user) {
      const { loadUserRentals } = useRentalsStore.getState();
      loadUserRentals();
    }
  }, [session?.user?.id]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Show message for 1.5 seconds then redirect
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return <LoadingPage title="טוען פרטי משתמש..." />;
  }


  // Show message if unauthenticated (before redirect)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            יש להתחבר
          </h2>
          <p className="text-gray-600 mb-4">
            על מנת לצפות בפרטים האישיים יש להתחבר תחילה
          </p>
          <p className="text-sm text-gray-500">
            מעביר לדף הבית...
          </p>
        </div>
      </div>
    );
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

        {/* My Rentals Section */}
        <div id="my-rentals" className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ההשאלות שלי
          </h2>
          <Suspense fallback={<LoadingPage title="טוען בקשות..." />}>
            <MyRentalsContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}