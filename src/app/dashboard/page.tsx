'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCoordinatorStore, useFilteredCoordinatorRentals, useCoordinatorRentalCounts } from '@/store/coordinator-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, UserIcon, GamepadIcon, TrendingUpIcon, ClockIcon } from 'lucide-react';
import { formatDate as utilFormatDate } from '@/lib/utils';
import type { RentalStatus } from '@/types';

export default function CoordinatorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    setError
  } = useCoordinatorStore();

  const filteredRentals = useFilteredCoordinatorRentals();
  const rentalCounts = useCoordinatorRentalCounts();

  // Redirect if not authenticated or not a coordinator
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (!session.user.roles.includes('CENTER_COORDINATOR') && !session.user.roles.includes('ADMIN'))) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Load dashboard data on mount
  useEffect(() => {
    if (session?.user && (session.user.roles.includes('CENTER_COORDINATOR') || session.user.roles.includes('ADMIN'))) {
      loadDashboard();
      loadRentals();
      loadGameInstances();
    }
  }, [session, loadDashboard, loadRentals, loadGameInstances]);

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

  const getStatusBadgeVariant = (status: RentalStatus) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'ACTIVE': return 'default';
      case 'RETURNED': return 'outline';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const isOverdue = (rental: any) => {
    return rental.status === 'ACTIVE' && 
           rental.expectedReturnDate && 
           new Date(rental.expectedReturnDate) < new Date();
  };

  if (status === 'loading' || isLoadingDashboard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || (!session.user.roles.includes('CENTER_COORDINATOR') && !session.user.roles.includes('ADMIN'))) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage rentals and game instances for your center
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({rentalCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({rentalCounts.active})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Rentals</CardTitle>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalCounts.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rentalCounts.active}</div>
                <p className="text-xs text-muted-foreground">Currently rented</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{rentalCounts.overdue}</div>
                <p className="text-xs text-muted-foreground">Past return date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Game Instances</CardTitle>
                <GamepadIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameInstances.length}</div>
                <p className="text-xs text-muted-foreground">Available games</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              {rentals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No rentals found</p>
              ) : (
                <div className="space-y-4">
                  {rentals.slice(0, 5).map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{rental.user?.name || 'Unknown User'}</span>
                          <Badge variant={getStatusBadgeVariant(rental.status)}>
                            {rental.status}
                          </Badge>
                          {isOverdue(rental) && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rental.gameInstances?.map(gi => gi.game?.name).join(', ') || 'No games'} • 
                          {formatDate(rental.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {rental.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveRental(rental.id)}
                            disabled={isSubmitting}
                          >
                            Approve
                          </Button>
                        )}
                        {rental.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkReturned(rental.id)}
                            disabled={isSubmitting}
                          >
                            Mark Returned
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Rentals Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {rentals.filter(r => r.status === 'PENDING').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending rentals</p>
              ) : (
                <div className="space-y-4">
                  {rentals
                    .filter(rental => rental.status === 'PENDING')
                    .map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{rental.user?.name || 'Unknown User'}</span>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rental.gameInstances?.map(gi => gi.game?.name).join(', ') || 'No games'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {formatDate(rental.createdAt)}
                          </p>
                          {rental.expectedReturnDate && (
                            <p className="text-xs text-muted-foreground">
                              Expected Return: {formatDate(rental.expectedReturnDate)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRental(rental.id)}
                            disabled={isSubmitting}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Rentals Tab */}
        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              {rentals.filter(r => r.status === 'ACTIVE').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active rentals</p>
              ) : (
                <div className="space-y-4">
                  {rentals
                    .filter(rental => rental.status === 'ACTIVE')
                    .map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{rental.user?.name || 'Unknown User'}</span>
                            <Badge variant="default">Active</Badge>
                            {isOverdue(rental) && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rental.gameInstances?.map(gi => gi.game?.name).join(', ') || 'No games'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Borrowed: {rental.borrowDate ? formatDate(rental.borrowDate) : 'N/A'}
                          </p>
                          {rental.expectedReturnDate && (
                            <p className={`text-xs ${isOverdue(rental) ? 'text-destructive' : 'text-muted-foreground'}`}>
                              Expected Return: {formatDate(rental.expectedReturnDate)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkReturned(rental.id)}
                            disabled={isSubmitting}
                          >
                            Mark Returned
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rental History</CardTitle>
            </CardHeader>
            <CardContent>
              {rentals.filter(r => r.status === 'RETURNED' || r.status === 'CANCELLED').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No rental history</p>
              ) : (
                <div className="space-y-4">
                  {rentals
                    .filter(rental => rental.status === 'RETURNED' || rental.status === 'CANCELLED')
                    .map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{rental.user?.name || 'Unknown User'}</span>
                            <Badge variant={getStatusBadgeVariant(rental.status)}>
                              {rental.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rental.gameInstances?.map(gi => gi.game?.name).join(', ') || 'No games'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rental.status === 'RETURNED' 
                              ? `Returned: ${rental.returnDate ? formatDate(rental.returnDate) : 'N/A'}`
                              : `Cancelled: ${formatDate(rental.createdAt)}`
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSubmitting}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}