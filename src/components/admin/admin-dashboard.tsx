'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminStore } from '@/store/admin-store';
import { 
  SystemStats, 
  UserManagementTable, 
  CenterManagementTable, 
  GameManagementTable 
} from '@/components/admin';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const {
    games,
    centers,
    users,
    systemStats,
    isLoadingGames,
    isLoadingCenters,
    isLoadingUsers,
    isLoadingStats,
    isSubmitting,
    error,
    loadGames,
    loadCenters,
    loadUsers,
    loadSystemStats,
    blockUser,
    unblockUser,
    assignRole,
    deleteGame,
    deleteCenter,
    setError
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
    };
    
    loadAllData();
  }, [loadSystemStats, loadUsers, loadCenters, loadGames]);

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'block':
          await blockUser(userId);
          break;
        case 'unblock':
          await unblockUser(userId);
          break;
        case 'view':
          // TODO: Implement user details modal
          console.log('View user details:', userId);
          break;
      }
    } catch (err) {
      setError(`Failed to ${action} user`);
    }
  };

  const handleCenterAction = async (action: string, centerId: string) => {
    try {
      switch (action) {
        case 'delete':
          await deleteCenter(centerId);
          break;
        case 'edit':
          // TODO: Implement edit center modal
          console.log('Edit center:', centerId);
          break;
        case 'view':
          // TODO: Implement center details modal
          console.log('View center details:', centerId);
          break;
      }
    } catch (err) {
      setError(`Failed to ${action} center`);
    }
  };

  const handleGameAction = async (action: string, gameId: string) => {
    try {
      switch (action) {
        case 'delete':
          await deleteGame(gameId);
          break;
        case 'edit':
          // TODO: Implement edit game modal
          console.log('Edit game:', gameId);
          break;
        case 'view':
          // TODO: Implement game details modal
          console.log('View game details:', gameId);
          break;
      }
    } catch (err) {
      setError(`Failed to ${action} game`);
    }
  };

  const isLoading = isLoadingStats || isLoadingUsers || isLoadingCenters || isLoadingGames;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System administration and management tools
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
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="centers">Centers ({centers.length})</TabsTrigger>
          <TabsTrigger value="games">Games ({games.length})</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <SystemStats 
            stats={{
              totalUsers: users.length,
              totalCenters: centers.length,
              totalGames: games.length,
              totalRentals: systemStats?.totalRentals || 0,
              activeRentals: systemStats?.activeRentals || 0,
              pendingRentals: systemStats?.pendingRentals || 0
            }}
          />
          
          {/* Quick Actions or Recent Activity could go here */}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <UserManagementTable
            users={users}
            onBlockUser={(userId) => handleUserAction('block', userId)}
            onUnblockUser={(userId) => handleUserAction('unblock', userId)}
            onAssignRole={(userId, role) => {
              // TODO: Implement role assignment
              console.log('Assign role:', role, 'to user:', userId);
            }}
            onViewDetails={(userId) => handleUserAction('view', userId)}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        {/* Centers Tab */}
        <TabsContent value="centers" className="space-y-6">
          <CenterManagementTable
            centers={centers}
            onEditCenter={(centerId) => handleCenterAction('edit', centerId)}
            onDeleteCenter={(centerId) => handleCenterAction('delete', centerId)}
            onViewDetails={(centerId) => handleCenterAction('view', centerId)}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          <GameManagementTable
            games={games}
            onEditGame={(gameId) => handleGameAction('edit', gameId)}
            onDeleteGame={(gameId) => handleGameAction('delete', gameId)}
            onViewDetails={(gameId) => handleGameAction('view', gameId)}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}