'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { formatUserName } from '@/lib/utils';
import { getAreaLabel } from '@/lib/labels';
import type { CenterForAdmin } from '@/types';

interface CenterManagementTableProps {
  centers: CenterForAdmin[];
  onEditCenter: (centerId: string) => void;
  onDeleteCenter: (centerId: string) => void;
  onViewDetails: (centerId: string) => void;
  onCreateCenter?: () => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
}

export function CenterManagementTable({
  centers,
  onEditCenter,
  onDeleteCenter,
  onViewDetails,
  onCreateCenter,
  isSubmitting = false,
  isLoading = false,
}: CenterManagementTableProps) {

  const columns: ColumnDef<CenterForAdmin>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="שם המוקד" />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('name')}</div>;
      },
    },
    {
      accessorKey: 'area',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="אזור" />
      ),
      cell: ({ row }) => {
        const area = row.getValue('area') as string;
        return (
          <Badge variant="outline">
            {getAreaLabel(area as any)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'coordinator',
      header: 'רכז',
      cell: ({ row }) => {
        const coordinator = row.original.coordinator;
        return (
          <div className="text-sm">
            {coordinator
              ? formatUserName(coordinator.firstName, coordinator.lastName)
              : 'אין רכז משוייך'}
          </div>
        );
      },
    },
    {
      accessorKey: 'superCoordinator',
      header: 'רכז על',
      cell: ({ row }) => {
        const superCoordinator = row.original.superCoordinator;
        return (
          <div className="text-sm">
            {superCoordinator
              ? formatUserName(superCoordinator.firstName, superCoordinator.lastName)
              : '-'}
          </div>
        );
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
          <Badge variant="destructive">לא פעיל</Badge>
        );
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
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(center.id);
              }}
              disabled={isSubmitting}
            >
              פרטים
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEditCenter(center.id);
              }}
              disabled={isSubmitting}
            >
              עריכה
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCenter(center.id);
              }}
              disabled={isSubmitting}
            >
              מחיקה
            </Button>
          </div>
        );
      },
    },
  ];

  const renderMobileCard = (center: CenterForAdmin) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{center.name}</span>
          <Badge variant="outline">{getAreaLabel(center.area)}</Badge>
          {!center.isActive && <Badge variant="destructive">לא פעיל</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          רכז: {center.coordinator
            ? formatUserName(center.coordinator.firstName, center.coordinator.lastName)
            : 'אין רכז משוייך'}
        </p>
        {center.superCoordinator && (
          <p className="text-xs text-muted-foreground">
            רכז על: {formatUserName(center.superCoordinator.firstName, center.superCoordinator.lastName)}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(center.id)}
          disabled={isSubmitting}
        >
          פרטים
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onEditCenter(center.id)}
          disabled={isSubmitting}
        >
          עריכה
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDeleteCenter(center.id)}
          disabled={isSubmitting}
        >
          מחיקה
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>ניהול מוקדים</CardTitle>
        {onCreateCenter && (
          <Button onClick={onCreateCenter} size="sm">
            הוסף מוקד חדש
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={centers}
          searchKey="name"
          searchPlaceholder="חיפוש לפי שם מוקד..."
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
