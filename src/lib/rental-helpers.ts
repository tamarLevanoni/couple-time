import { GameBasic, CenterPublicInfo } from '@/types';

/**
 * Helper type representing a single game instance from a center
 * Extracted from the CenterPublicInfo type for reusability
 */
export type GameInstance = NonNullable<CenterPublicInfo['gameInstances']>[number];

/**
 * Build rental notes with status information for unavailable games
 *
 * Automatically appends status messages for games that are BORROWED or UNAVAILABLE
 * to inform coordinators that this is a waitlist request
 *
 * @param userNotes - User-provided notes text
 * @param gameInstances - Array of selected game instances with their status
 * @param games - Array of all games (used to lookup game names)
 * @returns Combined notes string with user notes and auto-generated status messages
 *
 * @example
 * const notes = buildRentalNotes(
 *   'Please call before pickup',
 *   [{ status: 'BORROWED', gameId: 'game-1' }],
 *   [{ id: 'game-1', name: 'טוויסטר' }]
 * );
 * // Returns: "Please call before pickup\n\nטוויסטר כרגע מושאל - בקשה לרשימת המתנה"
 */
export function buildRentalNotes(
  userNotes: string,
  gameInstances: GameInstance[],
  games: GameBasic[]
): string {
  const statusNotes = gameInstances
    .map(instance => {
      const gameName = games.find(g => g.id === instance.gameId)?.name || 'משחק';

      if (instance.status === 'BORROWED') {
        return `${gameName} כרגע מושאל - בקשה לרשימת המתנה`;
      } else if (instance.status === 'UNAVAILABLE') {
        return `${gameName} כרגע לא זמין - בקשה לרשימת המתנה`;
      }
      return null;
    })
    .filter((note): note is string => note !== null);

  const trimmedNotes = userNotes.trim();

  if (statusNotes.length === 0) {
    return trimmedNotes;
  }

  const statusText = statusNotes.join('\n');
  return trimmedNotes ? `${trimmedNotes}\n\n${statusText}` : statusText;
}
