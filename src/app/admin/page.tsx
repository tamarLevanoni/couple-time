'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading';
import { useAdminStore } from '@/store/admin-store';
import { useToast } from '@/hooks/use-toast';
import { UsersTab } from '@/components/admin';

type TabType = 'users' | 'centers' | 'games' | 'stats';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('users');

  const {
    users,
    centers,
    isLoadingGames,
    isLoadingCenters,
    isLoadingUsers,
    isLoadingStats,
    warnings,
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

  // Show warnings as toasts
  useEffect(() => {
    if (warnings.length > 0) {
      warnings.forEach((warning) => {
        toast({
          title: 'אזהרה',
          description: warning,
          variant: 'warning',
        });
      });
    }
  }, [warnings, toast]);

  if (status === 'loading') {
    return <LoadingPage title='Loading dashboard...' />;
  }

  const isLoading = isInitialLoad || isLoadingStats || isLoadingUsers || isLoadingCenters || isLoadingGames;

  if (isLoading) {
    return <LoadingPage title='Loading admin dashboard...' />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ניהול מערכת</h1>
        <p className="text-gray-600 mt-2">ניהול משתמשים, מוקדים ומשחקים</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            משתמשים
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'centers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            מוקדים
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'games'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            משחקים
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            סטטיסטיקות
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            centers={centers}
            isLoading={isLoadingUsers}
          />
        )}
        {activeTab === 'centers' && (
          <div className="text-center py-12 text-gray-500">
            מוקדים - בקרוב
          </div>
        )}
        {activeTab === 'games' && (
          <div className="text-center py-12 text-gray-500">
            משחקים - בקרוב
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="text-center py-12 text-gray-500">
            סטטיסטיקות - בקרוב
          </div>
        )}
      </div>
    </div>
  );
}
