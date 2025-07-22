'use client';

import { Suspense } from 'react';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { 
  useGamesStore, 
  useCentersStore
} from '@/store';
import { GamesContent } from '@/components/games/games-content';

function GamesPageContent() {
  // Store hooks
  const { games, loadGames, isLoading: gamesLoading, error: gamesError } = useGamesStore();
  const { centers, loadCenters, isLoading: centersLoading, error: centersError } = useCentersStore();

  // Loading states - only show loading if we have no data at all
  const isLoading = (gamesLoading && games.length === 0) || (centersLoading && centers.length === 0);
  const error = gamesError || centersError;

  if (isLoading) {
    return <LoadingPage title="טוען משחקים..." />;
  }
  
  if (error) {
    return (
      <ErrorPage 
        message={error} 
        action={{
          label: 'נסה שוב',
          onClick: () => {
            loadGames();
            loadCenters();
          }
        }}
      />
    );
  }

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            משחקי זוגות ומשפחה
          </h1>
          <p className="text-lg text-gray-600">
            בחרו משחק ומוקד לביצוע בקשת השאלה
          </p>
        </div>

        <Suspense fallback={<LoadingPage title="טוען תוכן..." />}>
          <GamesContent />
        </Suspense>
      </div>
  );
}

export default function GamesPage() {
  return <GamesPageContent />;
}