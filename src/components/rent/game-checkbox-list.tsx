'use client';

import { GameBasic } from '@/types';
import { GameInstance } from '@/lib/rental-helpers';

interface GameInstanceWithGame extends GameInstance {
  game: GameBasic;
}

interface GameCheckboxListProps {
  gameInstances: GameInstanceWithGame[];
  selectedInstanceIds: string[];
  onToggle: (instanceId: string, checked: boolean) => void;
}

/**
 * GameCheckboxList - Displays a scrollable list of game instances with checkboxes for selection
 * @param gameInstances - Array of game instances with full game details to display
 * @param selectedInstanceIds - Array of currently selected game instance IDs
 * @param onToggle - Callback fired when a game instance is selected/deselected
 */
export function GameCheckboxList({ gameInstances, selectedInstanceIds, onToggle }: GameCheckboxListProps) {
  return (
    <div>
      <label id="game-selection-label" className="block text-sm font-medium text-gray-700 mb-2">
        בחר משחקים זמינים במוקד <span className="text-red-500">*</span>
      </label>
      {gameInstances.length > 0 && (
        <p className="text-sm text-gray-600 mb-2">
          {gameInstances.length} משחקים זמינים במוקד זה
        </p>
      )}
      <div
        className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto"
        role="group"
        aria-labelledby="game-selection-label"
        aria-describedby={selectedInstanceIds.length > 0 ? "selected-games-count" : undefined}
      >
        {gameInstances.length === 0 ? (
          <p className="text-gray-500 text-sm">בחר מוקד כדי לראות משחקים זמינים</p>
        ) : (
          <div className="space-y-2">
            {gameInstances.map(instance => (
              <label
                key={instance.id}
                className="flex items-center space-x-3 space-x-reverse cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedInstanceIds.includes(instance.id)}
                  onChange={(e) => onToggle(instance.id, e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  aria-label={`בחר משחק ${instance.game.name}`}
                />
                <span className="text-sm text-gray-700">{instance.game.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {selectedInstanceIds.length > 0 && (
        <p id="selected-games-count" className="mt-2 text-sm text-green-600" role="status" aria-live="polite">
          נבחרו {selectedInstanceIds.length} משחקים
        </p>
      )}
    </div>
  );
}
