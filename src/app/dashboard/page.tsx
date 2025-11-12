'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CoordinatorDashboard } from '@/components/coordinator';
import { LoadingPage } from '@/components/ui/loading';
import { Role } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      if (!session.user.roles.includes('CENTER_COORDINATOR')) {
        router.push('/');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <LoadingPage title='Loading dashboard...' />;
  }

  // Default to coordinator dashboard for CENTER_COORDINATOR and SUPER_COORDINATOR
  return (
    <>
      <CoordinatorDashboard />
    </>
  );
}
