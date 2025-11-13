'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/admin/shared/modals/confirm-dialog';
import { CenterForAdmin } from '@/types';
import { Area } from '@/types/schema';
import { formatUserName } from '@/lib/utils';
import { getAreaLabel } from '@/lib/labels';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';

interface CenterManagementTableProps {
  centers: CenterForAdmin[];
  isLoading?: boolean;
  onViewDetails: (center: CenterForAdmin) => void;
  onEdit: (center: CenterForAdmin) => void;
  onDelete: (id: string) => void;
  onCreateCenter: () => void;
}

export function CenterManagementTable({
  centers,
  isLoading = false,
  onViewDetails,
  onEdit,
  onDelete,
  onCreateCenter,
}: CenterManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<CenterForAdmin | null>(null);

  const handleDeleteClick = (center: CenterForAdmin) => {
    setCenterToDelete(center);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (centerToDelete) {
      onDelete(centerToDelete.id);
      setDeleteDialogOpen(false);
      setCenterToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setCenterToDelete(null);
  };

  const columns = useMemo<ColumnDef<CenterForAdmin>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'שם',
        cell: ({ row }) => row.original.name,
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          return row.original.name.toLowerCase().includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי שם...',
        },
      },
      {
        accessorKey: 'area',
        header: 'אזור',
        cell: ({ row }) => getAreaLabel(row.original.area),
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return row.original.area === filterValue;
        },
        meta: {
          filterVariant: 'select',
          filterPlaceholder: 'כל האזורים',
          filterOptions: [
            { label: 'כל האזורים', value: '' },
            { label: getAreaLabel('NORTH'), value: 'NORTH' },
            { label: getAreaLabel('CENTER'), value: 'CENTER' },
            { label: getAreaLabel('SOUTH'), value: 'SOUTH' },
            { label: getAreaLabel('JERUSALEM'), value: 'JERUSALEM' },
            { label: getAreaLabel('JUDEA_SAMARIA'), value: 'JUDEA_SAMARIA' },
          ],
        },
      },
      {
        accessorKey: 'coordinator',
        header: 'רכז מוקד',
        cell: ({ row }) => {
          const coordinator = row.original.coordinator;
          return coordinator
            ? formatUserName(coordinator.firstName, coordinator.lastName)
            : '-';
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          const coordinator = row.original.coordinator;
          if (!coordinator) return false;
          const fullName = formatUserName(
            coordinator.firstName,
            coordinator.lastName
          ).toLowerCase();
          return fullName.includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי רכז...',
        },
      },
      {
        accessorKey: 'superCoordinator',
        header: 'רכז על',
        cell: ({ row }) => {
          const superCoordinator = row.original.superCoordinator;
          return superCoordinator
            ? formatUserName(superCoordinator.firstName, superCoordinator.lastName)
            : '-';
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          const superCoordinator = row.original.superCoordinator;
          if (!superCoordinator) return false;
          const fullName = formatUserName(
            superCoordinator.firstName,
            superCoordinator.lastName
          ).toLowerCase();
          return fullName.includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי רכז על...',
        },
      },
      {
        accessorKey: 'games',
        header: 'משחקים',
        cell: ({ row }) => row.original._count.gameInstances,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'isActive',
        header: 'סטטוס',
        cell: ({ row }) => {
          const center = row.original;
          return (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                center.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {center.isActive ? 'פעיל' : 'לא פעיל'}
            </span>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return row.original.isActive === (filterValue === 'true');
        },
        meta: {
          filterVariant: 'select',
          filterPlaceholder: 'הכל',
          filterOptions: [
            { label: 'הכל', value: '' },
            { label: 'פעיל', value: 'true' },
            { label: 'לא פעיל', value: 'false' },
          ],
        },
      },
      {
        id: 'actions',
        header: 'פעולות',
        cell: ({ row }) => {
          const center = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(center)}
                title="פרטים"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(center)}
                title="ערוך"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(center)}
                title="מחק"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
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
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">ניהול מוקדים</h2>
          <Button onClick={onCreateCenter}>
            <Plus className="h-4 w-4 ml-2" />
            הוספת מוקד
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={centers}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="חיפוש מוקדים..."
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="מחיקת מוקד"
        message={
          centerToDelete
            ? `האם אתה בטוח שברצונך למחוק את המוקד "${centerToDelete.name}"?${
                centerToDelete._count.gameInstances > 0
                  ? `\n\nשים לב: המוקד מכיל ${centerToDelete._count.gameInstances} משחקים שיימחקו גם כן.`
                  : ''
              }\n\nפעולה זו אינה הפיכה.`
            : 'האם אתה בטוח?'
        }
        confirmLabel="מחק"
        variant="destructive"
      />
    </>
  );
}
