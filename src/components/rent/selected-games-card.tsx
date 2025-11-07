'use client';

import { Card } from '@/components/ui/card';
import { GameController } from '@/components/icons';
import { GameBasic } from '@/types';
import { getCategoryLabel } from '@/lib/game-labels';
import { useImageFallbackById } from '@/hooks/use-image-fallback';

interface SelectedGamesCardProps {
  selectedGames: GameBasic[];
}

/**
 * SelectedGamesCard - Displays a summary card of selected games in the rental form
 * Shows game images (with fallback), names, and categories
 * @param selectedGames - Array of selected games to display
 */
export function SelectedGamesCard({ selectedGames }: SelectedGamesCardProps) {
  const { hasFailed, handleError } = useImageFallbackById();

  if (selectedGames.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center mb-3">
        <GameController className="h-5 w-5 text-primary ml-2" />
        <h3 className="font-semibold text-gray-900">
          משחקים נבחרים ({selectedGames.length})
        </h3>
      </div>
      <div className="space-y-3">
        {selectedGames.map(game => (
          <div key={game.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
            <div className="flex space-x-3 space-x-reverse">
              {/* Game Image */}
              {game.imageUrl && !hasFailed(game.id) ? (
                <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <img
                    src={game.imageUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={() => handleError(game.id)}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md">
                  <div className="text-lg">🎲</div>
                </div>
              )}

              {/* Game Info */}
              <div className="flex-1 space-y-1 text-sm">
                <p className="font-medium">{game.name}</p>
                <div className="text-xs text-gray-500">
                  {game.categories.map(cat => getCategoryLabel(cat)).join(' • ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
