'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/admin/shared/modals/confirm-dialog';
import { Eye, Edit, Plus } from 'lucide-react';
import { GameWithInstances } from '@/types/models';
import { getCategoryLabel, getAudienceLabel } from '@/lib/labels';
import { GameCategory, TargetAudience } from '@/types/schema';

interface GameManagementTableProps {
  games: GameWithInstances[];
  isLoading?: boolean;
  onViewDetails: (game: GameWithInstances) => void;
  onEdit: (game: GameWithInstances) => void;
  onDelete: (id: string) => void;
  onCreateGame: () => void;
}

const ALL_CATEGORIES: GameCategory[] = [
  GameCategory.COMMUNICATION,
  GameCategory.INTIMACY,
  GameCategory.FUN,
  GameCategory.THERAPY,
  GameCategory.PERSONAL_DEVELOPMENT,
];

const ALL_AUDIENCES: TargetAudience[] = [
  TargetAudience.SINGLES,
  TargetAudience.MARRIED,
  TargetAudience.GENERAL,
];

export function GameManagementTable({
  games,
  isLoading = false,
  onViewDetails,
  onEdit,
  onDelete,
  onCreateGame,
}: GameManagementTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameWithInstances | null>(null);

  const handleDeleteClick = (game: GameWithInstances) => {
    setGameToDelete(game);
    setDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setGameToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (gameToDelete) {
      onDelete(gameToDelete.id);
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  const columns = useMemo<ColumnDef<GameWithInstances>[]>(
    () => [
      {
        accessorKey: 'image',
        header: 'תמונה',
        cell: ({ row }) => {
          const game = row.original;
          return (
            <div className="flex items-center gap-2">
              {game.primaryImageUrl ? (
                <div className="relative">
                  <img
                    src={game.primaryImageUrl}
                    alt={game.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  {game.galleryImageUrls && game.galleryImageUrls.length > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-1 rounded">
                      +{game.galleryImageUrls.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                  🎲
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'name',
        header: 'שם המשחק',
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return row.original.name.toLowerCase().includes(filterValue.toLowerCase());
        },
        meta: {
          filterVariant: 'text',
          filterPlaceholder: 'חיפוש לפי שם...',
        },
      },
      {
        accessorKey: 'categories',
        header: 'קטגוריות',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {getCategoryLabel(cat)}
              </Badge>
            ))}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return row.original.categories.includes(filterValue as GameCategory);
        },
        meta: {
          filterVariant: 'select',
          filterPlaceholder: 'כל הקטגוריות',
          filterOptions: [
            { label: 'כל הקטגוריות', value: '' },
            ...ALL_CATEGORIES.map((cat) => ({
              label: getCategoryLabel(cat),
              value: cat,
            })),
          ],
        },
      },
      {
        accessorKey: 'targetAudiences',
        header: 'קהל יעד',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.targetAudiences.map((audience) => (
              <Badge key={audience} variant="outline" className="text-xs">
                {getAudienceLabel(audience)}
              </Badge>
            ))}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return row.original.targetAudiences.includes(filterValue as TargetAudience);
        },
        meta: {
          filterVariant: 'select',
          filterPlaceholder: 'כל קהלי היעד',
          filterOptions: [
            { label: 'כל קהלי היעד', value: '' },
            ...ALL_AUDIENCES.map((aud) => ({
              label: getAudienceLabel(aud),
              value: aud,
            })),
          ],
        },
      },
      {
        accessorKey: 'instances',
        header: 'עותקים במערכת',
        cell: ({ row }) => {
          const count = row.original.gameInstances?.length || 0;
          return (
            <div className="text-center">
              <span className={count === 0 ? 'text-gray-400' : 'font-medium'}>
                {count}
              </span>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: 'actions',
        header: 'פעולות',
        cell: ({ row }) => {
          const game = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(game)}
                title="פרטים"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(game)}
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
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">ניהול משחקים</h2>
          <Button onClick={onCreateGame}>
            <Plus className="h-4 w-4 ml-2" />
            הוספת משחק
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={games}
          isLoading={isLoading}
          searchKey="name"
          searchPlaceholder="חיפוש משחקים..."
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="מחיקת משחק"
        message={
          gameToDelete
            ? `האם אתה בטוח שברצונך למחוק את המשחק "${gameToDelete.name}"?${
                gameToDelete.gameInstances && gameToDelete.gameInstances.length > 0
                  ? `\n\nשים לב: קיימים ${gameToDelete.gameInstances.length} עותקים של משחק זה במוקדים שונים. מחיקת המשחק תמחק גם את כל העותקים.`
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
