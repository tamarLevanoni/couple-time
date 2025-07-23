'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUserName } from '@/lib/utils';
import type { Role, UserForAdmin } from '@/types';

interface UserManagementTableProps {
  users: UserForAdmin[];
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onAssignRole: (userId: string, role: Role) => void;
  onViewDetails: (userId: string) => void;
  isSubmitting?: boolean;
}

export function UserManagementTable({ 
  users, 
  onBlockUser, 
  onUnblockUser, 
  onAssignRole, 
  onViewDetails, 
  isSubmitting = false 
}: UserManagementTableProps) {
  const getRoleBadgeVariant = (roles: string[]) => {
    if (roles.includes('ADMIN')) return 'destructive';
    if (roles.includes('SUPER_COORDINATOR')) return 'default';
    if (roles.includes('CENTER_COORDINATOR')) return 'secondary';
    return 'outline';
  };

  const getMainRole = (roles: string[]) => {
    if (roles.includes('ADMIN')) return 'Admin';
    if (roles.includes('SUPER_COORDINATOR')) return 'Super Coordinator';
    if (roles.includes('CENTER_COORDINATOR')) return 'Coordinator';
    return 'User';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No users found</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{formatUserName(user.firstName, user.lastName)}</span>
                    <Badge variant={getRoleBadgeVariant(user.roles || [])}>
                      {getMainRole(user.roles || [])}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground">
                      {user.phone}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(user.id)}
                    disabled={isSubmitting}
                  >
                    Details
                  </Button>
                  
                  {user.isActive ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onBlockUser(user.id)}
                      disabled={isSubmitting}
                    >
                      Block
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onUnblockUser(user.id)}
                      disabled={isSubmitting}
                    >
                      Unblock
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}