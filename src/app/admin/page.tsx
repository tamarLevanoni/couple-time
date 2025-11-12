'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading';
import { useAdminStore } from '@/store/admin-store';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    isLoadingGames,
    isLoadingCenters,
    isLoadingUsers,
    isLoadingStats,
    loadGames,
    loadCenters,
    loadUsers,
    loadSystemStats,
  } = useAdminStore();

  // Load all admin data on mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadSystemStats(),
        loadUsers(),
        loadCenters(),
        loadGames()
      ]);
      setIsInitialLoad(false);
    };

    if (status !== 'loading' && session?.user.roles.includes('ADMIN')) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      if (!session.user.roles.includes('ADMIN')) {
        router.push('/');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingPage title='Loading dashboard...' />;
  }

  const isLoading = isInitialLoad || isLoadingStats || isLoadingUsers || isLoadingCenters || isLoadingGames;

  if (isLoading) {
    return <LoadingPage title='Loading admin dashboard...' />;
  }

  return (
    <>
    </>
  );
}
