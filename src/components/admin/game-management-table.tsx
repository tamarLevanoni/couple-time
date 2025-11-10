'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { getCategoryLabel, getAudienceLabel } from '@/lib/labels';
import type { GameWithInstances, GameCategory, TargetAudience } from '@/types';

interface GameManagementTableProps {
  games: GameWithInstances[];
  onEditGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onViewDetails: (gameId: string) => void;
  onCreateGame?: () => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
}

const getCategoryBadgeVariant = (category: string) => {
  switch (category) {
    case 'COMMUNICATION': return 'default';
    case 'INTIMACY': return 'destructive';
    case 'FUN': return 'secondary';
    case 'THERAPY': return 'outline';
    case 'PERSONAL_DEVELOPMENT': return 'outline';
    default: return 'outline';
  }
};

export function GameManagementTable({
  games,
  onEditGame,
  onDeleteGame,
  onViewDetails,
  onCreateGame,
  isSubmitting = false,
  isLoading = false,
}: GameManagementTableProps) {

  const columns: ColumnDef<GameWithInstances>[] = [
    {
      accessorKey: 'imageUrl',
      header: 'תמונה',
      cell: ({ row }) => {
        const imageUrl = row.getValue('imageUrl') as string | null;
        return imageUrl ? (
          <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
            <img
              src={imageUrl}
              alt={row.original.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
            <span className="text-xl">🎲</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="שם המשחק" />
      ),
      cell: ({ row }) => {
        return <div className="font-medium">{row.getValue('name')}</div>;
      },
    },
    {
      accessorKey: 'description',
      header: 'תיאור',
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null;
        return (
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {description || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'categories',
      header: 'קטגוריות',
      cell: ({ row }) => {
        const categories = row.getValue('categories') as GameCategory[];
        return (
          <div className="flex gap-1 flex-wrap">
            {categories.slice(0, 2).map((category) => (
              <Badge key={category} variant={getCategoryBadgeVariant(category)} className="text-xs">
                {getCategoryLabel(category)}
              </Badge>
            ))}
            {categories.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'targetAudiences',
      header: 'קהל יעד',
      cell: ({ row }) => {
        const audiences = row.getValue('targetAudiences') as TargetAudience[];
        return (
          <div className="flex gap-1 flex-wrap">
            {audiences.map((audience) => (
              <Badge key={audience} variant="secondary" className="text-xs">
                {getAudienceLabel(audience)}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: '_count',
      header: 'עותקים',
      cell: ({ row }) => {
        const count = (row.original as any)._count?.gameInstances || 0;

        return (
          <div className="text-sm">
            {count === 0 ? (
              <span className="text-muted-foreground">אין עותקים</span>
            ) : (
              <span className="font-medium">{count}</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'פעולות',
      cell: ({ row }) => {
        const game = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(game.id);
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
                onEditGame(game.id);
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
                onDeleteGame(game.id);
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

  const renderMobileCard = (game: GameWithInstances) => {
    const count = (game as any)._count?.gameInstances || 0;

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-4 flex-1">
          {game.imageUrl ? (
            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
              <span className="text-xl">🎲</span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{game.name}</span>
              <Badge variant={getCategoryBadgeVariant(game.categories[0])}>
                {getCategoryLabel(game.categories[0])}
              </Badge>
            </div>
            {game.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {game.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              עותקים: {count}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(game.id)}
            disabled={isSubmitting}
          >
            פרטים
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEditGame(game.id)}
            disabled={isSubmitting}
          >
            עריכה
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDeleteGame(game.id)}
            disabled={isSubmitting}
          >
            מחיקה
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>ניהול משחקים</CardTitle>
        {onCreateGame && (
          <Button onClick={onCreateGame} size="sm">
            הוסף משחק חדש
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={games}
          searchKey="name"
          searchPlaceholder="חיפוש לפי שם משחק..."
          renderMobileCard={renderMobileCard}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
