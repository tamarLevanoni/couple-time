'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GameWithInstances } from '@/types';

interface GameManagementTableProps {
  games: GameWithInstances[];
  onEditGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onViewDetails: (gameId: string) => void;
  isSubmitting?: boolean;
}

export function GameManagementTable({ 
  games, 
  onEditGame, 
  onDeleteGame, 
  onViewDetails, 
  isSubmitting = false 
}: GameManagementTableProps) {
  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'STRATEGY': return 'default';
      case 'FAMILY': return 'secondary';
      case 'PARTY': return 'outline';
      case 'COOPERATIVE': return 'destructive';
      default: return 'outline';
    }
  };

  const getInstancesInfo = (instances: any[]) => {
    if (!instances || instances.length === 0) return 'No instances';
    
    const available = instances.filter(i => i.status === 'AVAILABLE').length;
    const total = instances.length;
    return `${available}/${total} available`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Management</CardTitle>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No games found</p>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{game.name}</span>
                    <Badge variant={getCategoryBadgeVariant(game.categories[0])}>
                      {game.categories[0]}
                    </Badge>
                  </div>
                  {game.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {game.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(game.id)}
                    disabled={isSubmitting}
                  >
                    Details
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditGame(game.id)}
                    disabled={isSubmitting}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteGame(game.id)}
                    disabled={isSubmitting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}