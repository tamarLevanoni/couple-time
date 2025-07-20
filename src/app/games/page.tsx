'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useGamesStore, useFilteredGames, useCentersStore } from '@/store';
import { CenterBasic, GameBasic } from '@/types';

export default function GamesPage() {
  const { 
    games,
    isLoading, 
    error,
    searchTerm,
    selectedCategories,
    setIds,
    loadGames,
    setSearch,
    setCategories,
    clearFilters
  } = useGamesStore();
  const {centers}=useCentersStore();

  const filteredGames = useFilteredGames();

  const [selectedCenter, setSelectedCenter] = useState<string|null>();

  useEffect(()=>{
    const center=centers.find(center=>center.id==selectedCenter);
    const gameIds=center?.gameInstances.map(gi=>gi.gameId);
    if(gameIds?.length) setIds(gameIds);


  },[selectedCenter])


  if (isLoading) {
    return <LoadingPage title="טוען משחקים..." />;
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorPage 
          message={error} 
          action={{
            label: 'נסה שוב',
            onClick: loadGames
          }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            קטלוג משחקים
          </h1>
          <p className="text-lg text-gray-600">
            עיינו במשחקי הזוגיות שלנו ובחרו את המתאים עבורכם
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                חיפוש
              </label>
              <Input
                placeholder="חפש משחק..."
                value={searchTerm || ''}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מוקד
              </label>
              <Select
                value={selectedCenter || ''}
                onChange={(e) => setSelectedCenter(e.target.value || null)}
                options={[
                  { value: '', label: 'כל המוקדים' },
                  ...centers.map(center => ({
                    value: center.id,
                    label: center.name
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה
              </label>
              <Select
                value={selectedCategories[0] || ''}
                onChange={(e) => setCategories(e.target.value ? [e.target.value as any] : [])}
                options={[
                  { value: '', label: 'כל הקטגוריות' },
                  { value: 'COMMUNICATION', label: 'תקשורת' },
                  { value: 'INTIMACY', label: 'אינטימיות' },
                  { value: 'FUN', label: 'כיף ובידור' },
                  { value: 'THERAPY', label: 'טיפול' },
                  { value: 'PERSONAL_DEVELOPMENT', label: 'פיתוח אישי' }
                ]}
              />
            </div>

            <div className="flex items-end space-x-2 space-x-reverse">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                נקה סינונים
              </Button>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">לא נמצאו משחקים מתאימים</p>
            </div>
          ) : (
            filteredGames.map((game:GameBasic) => (
              <Card key={game.id} className="overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {game.name}
                  </h3>
                  
                  {game.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {game.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div>
                      קטגוריות: {game.categories.map(cat => getCategoryLabel(cat)).join(', ')}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    קהל יעד: {game.targetAudiences.map(aud => getAudienceLabel(aud)).join(', ')}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        זמין במוקדים שונים
                      </div>
                      
                      <Button size="sm">
                        צפה בפרטים
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600">
          מציג {filteredGames.length} מתוך {games.length} משחקים
        </div>
      </div>
    </MainLayout>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    COMMUNICATION: 'תקשורת',
    INTIMACY: 'אינטימיות',
    FUN: 'כיף ובידור',
    THERAPY: 'טיפול',
    PERSONAL_DEVELOPMENT: 'פיתוח אישי'
  };
  return labels[category] || category;
}

function getAudienceLabel(audience: string): string {
  const labels: Record<string, string> = {
    SINGLES: 'רווקים',
    MARRIED: 'נשואים',
    GENERAL: 'כלל הציבור'
  };
  return labels[audience] || audience;
}