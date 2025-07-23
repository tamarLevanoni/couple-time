'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate as utilFormatDate } from '@/lib/utils';
import {
  useCoordinatorStore,
  useFilteredCoordinatorRentals,
  useCoordinatorRentalCounts,
} from '@/store/coordinator-store';
import { DashboardStats, RentalList } from '@/components/dashboard';

export function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const {
    dashboardData,
    rentals,
    gameInstances,
    selectedRentalStatus,
    isLoadingDashboard,
    isSubmitting,
    error,
    loadDashboard,
    loadRentals,
    loadGameInstances,
    filterRentalsByStatus,
    approveRental,
    markRentalReturned,
    setError,
  } = useCoordinatorStore();

  const filteredRentals = useFilteredCoordinatorRentals();
  const rentalCounts = useCoordinatorRentalCounts();

  // Load dashboard data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadDashboard(), loadRentals(), loadGameInstances()]);
    };

    loadData();
  }, []);

  const handleApproveRental = async (rentalId: string) => {
    try {
      await approveRental(rentalId);
    } catch (err) {
      setError('Failed to approve rental');
    }
  };

  const handleMarkReturned = async (rentalId: string) => {
    try {
      await markRentalReturned(rentalId);
    } catch (err) {
      setError('Failed to mark rental as returned');
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return utilFormatDate(date);
  };

  return isLoadingDashboard ? (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>
            Loading coordinator dashboard...
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Coordinator Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          Manage rentals and game instances for your center
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className='mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <p className='text-destructive text-sm'>{error}</p>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setError(null)}
            className='mt-2'
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='pending'>
            Pending ({rentalCounts.pending})
          </TabsTrigger>
          <TabsTrigger value='active'>
            Active ({rentalCounts.active})
          </TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <DashboardStats
            stats={{
              pending: rentalCounts.pending,
              active: rentalCounts.active,
              overdue: rentalCounts.overdue,
              gameInstances: gameInstances.length,
            }}
          />

          <RentalList
            title='Recent Rentals'
            rentals={rentals}
            onApprove={handleApproveRental}
            onMarkReturned={handleMarkReturned}
            isSubmitting={isSubmitting}
            formatDate={formatDate}
            limit={5}
          />
        </TabsContent>

        {/* Pending Rentals Tab */}
        <TabsContent value='pending' className='space-y-6'>
          <RentalList
            title='Pending Approvals'
            rentals={rentals.filter(rental => rental.status === 'PENDING')}
            onApprove={handleApproveRental}
            isSubmitting={isSubmitting}
            formatDate={formatDate}
            emptyMessage='No pending rentals'
          />
        </TabsContent>

        {/* Active Rentals Tab */}
        <TabsContent value='active' className='space-y-6'>
          <RentalList
            title='Active Rentals'
            rentals={rentals.filter(rental => rental.status === 'ACTIVE')}
            onMarkReturned={handleMarkReturned}
            isSubmitting={isSubmitting}
            formatDate={formatDate}
            emptyMessage='No active rentals'
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-6'>
          <RentalList
            title='Rental History'
            rentals={rentals.filter(
              rental =>
                rental.status === 'RETURNED' || rental.status === 'CANCELLED'
            )}
            isSubmitting={isSubmitting}
            formatDate={formatDate}
            emptyMessage='No rental history'
            showActions={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
