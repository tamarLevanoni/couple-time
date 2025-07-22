'use client';

import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { 
  useGamesStore, 
  useCentersStore
} from '@/store';
import { RentForm } from '@/components/rent/rent-form';

function RentPageContent() {
  // Store hooks
  const { games, loadGames, isLoading: gamesLoading, error: gamesError } = useGamesStore();
  const { centers, loadCenters, isLoading: centersLoading, error: centersError } = useCentersStore();
  
  // Loading states - only show loading if we have no data at all
  const isLoading = (gamesLoading && games.length === 0) || (centersLoading && centers.length === 0);
  const error = gamesError || centersError;
  
  if (isLoading) {
    return <LoadingPage title="טוען נתונים..." />;
  }
  
  if (error) {
    return (
      <MainLayout>
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
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            בקשת השאלת משחק
          </h1>
          <p className="text-lg text-gray-600">
            בחרו משחק ומוקד וצרו איתנו קשר לתיאום איסוף
          </p>
        </div>

        <Suspense fallback={<LoadingPage title="טוען טופס..." />}>
          <RentForm />
        </Suspense>
      </div>
    </MainLayout>
  );
}

export default function RentPage() {
  
  return <RentPageContent />;
}

