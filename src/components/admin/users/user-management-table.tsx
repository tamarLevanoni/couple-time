'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { UserForAdmin } from '@/types/computed';
import { Role } from '@/types/schema';
import { formatUserName } from '@/lib/utils';
import { getRoleLabel } from '@/lib/labels';
import { Eye, Edit, UserCog, Plus } from 'lucide-react';

interface UserManagementTableProps {
  users: UserForAdmin[];
  isLoading?: boolean;
  onViewDetails: (user: UserForAdmin) => void;
  onEdit: (user: UserForAdmin) => void;
  onCreateUser: () => void;
}

export function UserManagementTable({
  users,
  isLoading = false,
  onViewDetails,
  onEdit,
  onCreateUser,
}: UserManagementTableProps) {
  const columns = useMemo<ColumnDef<UserForAdmin>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'שם',
        cell: ({ row }) => {
          const user = row.original;
          return formatUserName(user.firstName, user.lastName);
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          const user = row.original;
          const fullName = formatUserName(user.firstName, user.lastName).toLowerCase();
          return fullName.includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי שם...',
        },
      },
      {
        accessorKey: 'email',
        header: 'אימייל',
        cell: ({ row }) => row.original.email,
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          return row.original.email.toLowerCase().includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי אימייל...',
        },
      },
      {
        accessorKey: 'phone',
        header: 'טלפון',
        cell: ({ row }) => row.original.phone || '-',
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          const phone = row.original.phone || '';
          return phone.includes(filterValue);
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי טלפון...',
        },
      },
      {
        accessorKey: 'roles',
        header: 'תפקיד',
        cell: ({ row }) => {
          const roles = row.original.roles;
          if (!roles || roles.length === 0) return 'משתמש רגיל';
          return roles.map((role) => getRoleLabel(role)).join(', ');
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          const roles = row.original.roles || [];
          return roles.includes(filterValue as Role);
        },
        meta: {
          filterVariant: 'select',
          filterPlaceholder: 'כל התפקידים',
          filterOptions: [
            { label: 'כל התפקידים', value: '' },
            { label: getRoleLabel('ADMIN'), value: 'ADMIN' },
            { label: getRoleLabel('SUPER_COORDINATOR'), value: 'SUPER_COORDINATOR' },
            { label: getRoleLabel('CENTER_COORDINATOR'), value: 'CENTER_COORDINATOR' },
            { label: 'משתמש רגיל', value: 'REGULAR' },
          ],
        },
      },
      {
        accessorKey: 'center',
        header: 'מוקד',
        cell: ({ row }) => {
          const user = row.original;
          return user.managedCenter?.name || '-';
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          const centerName = row.original.managedCenter?.name || '';
          return centerName.toLowerCase().includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי מוקד...',
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
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(user)}
                title="פרטים"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                title="ערוך"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onViewDetails, onEdit]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ניהול משתמשים</h2>
        <Button onClick={onCreateUser}>
          <Plus className="h-4 w-4 ml-2" />
          הוספת משתמש
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="חיפוש משתמש..."
        isLoading={isLoading}
      />
    </div>
  );
}
