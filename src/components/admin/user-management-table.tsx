'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { formatUserName } from '@/lib/utils';
import { getRoleLabel } from '@/lib/labels';
import type { Role, UserForAdmin } from '@/types';

interface UserManagementTableProps {
  users: UserForAdmin[];
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onAssignRole: (userId: string, role: Role) => void;
  onViewDetails: (userId: string) => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
}

const getRoleBadgeVariant = (roles: string[]) => {
  if (roles.includes('ADMIN')) return 'destructive';
  if (roles.includes('SUPER_COORDINATOR')) return 'default';
  if (roles.includes('CENTER_COORDINATOR')) return 'secondary';
  return 'outline';
};

const getMainRole = (roles: Role[]): string => {
  if (roles.includes('ADMIN')) return getRoleLabel('ADMIN');
  if (roles.includes('SUPER_COORDINATOR')) return getRoleLabel('SUPER_COORDINATOR');
  if (roles.includes('CENTER_COORDINATOR')) return getRoleLabel('CENTER_COORDINATOR');
  return 'משתמש';
};

export function UserManagementTable({
  users,
  onBlockUser,
  onUnblockUser,
  onAssignRole,
  onViewDetails,
  isSubmitting = false,
  isLoading = false,
}: UserManagementTableProps) {

  const columns: ColumnDef<UserForAdmin>[] = [
    {
      accessorKey: 'name',
      accessorFn: (row) => formatUserName(row.firstName, row.lastName),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="שם" />
      ),
      cell: ({ row }) => {
        const name = formatUserName(row.original.firstName, row.original.lastName);
        return <div className="font-medium">{name}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="אימייל" />
      ),
      cell: ({ row }) => {
        return <div className="text-sm">{row.getValue('email')}</div>;
      },
    },
    {
      accessorKey: 'phone',
      header: 'טלפון',
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string | null;
        return <div className="text-sm">{phone || '-'}</div>;
      },
    },
    {
      accessorKey: 'roles',
      header: 'תפקיד',
      cell: ({ row }) => {
        const roles = (row.getValue('roles') as Role[]) || [];
        return (
          <Badge variant={getRoleBadgeVariant(roles)}>
            {getMainRole(roles)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const roles = row.getValue(id) as Role[];
        return roles.some((role) => value.includes(role));
      },
    },
    {
      accessorKey: 'isActive',
      header: 'סטטוס',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return isActive ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            פעיל
          </Badge>
        ) : (
          <Badge variant="destructive">חסום</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'פעולות',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(user.id);
              }}
              disabled={isSubmitting}
            >
              פרטים
            </Button>

            {user.isActive ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onBlockUser(user.id);
                }}
                disabled={isSubmitting}
              >
                חסום
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnblockUser(user.id);
                }}
                disabled={isSubmitting}
              >
                בטל חסימה
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const renderMobileCard = (user: UserForAdmin) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">
            {formatUserName(user.firstName, user.lastName)}
          </span>
          <Badge variant={getRoleBadgeVariant(user.roles || [])}>
            {getMainRole(user.roles || [])}
          </Badge>
          {!user.isActive && <Badge variant="destructive">חסום</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {user.phone && (
          <p className="text-xs text-muted-foreground">{user.phone}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(user.id)}
          disabled={isSubmitting}
        >
          פרטים
        </Button>

        {user.isActive ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onBlockUser(user.id)}
            disabled={isSubmitting}
          >
            חסום
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onUnblockUser(user.id)}
            disabled={isSubmitting}
          >
            בטל חסימה
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>ניהול משתמשים</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={users}
          searchKey="name"
          searchPlaceholder="חיפוש לפי שם..."
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
