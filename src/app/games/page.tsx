'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  useGamesStore, 
  useFilteredGames, 
  useCentersStore, 
  useGamesActions,
  useGames,
  useAvailableCategories,
  useAvailableAudiences 
} from '@/store';
import { GameBasic, GameCategory, TargetAudience, CenterPublicInfo, GameInstanceStatus } from '@/types';

export default function GamesPage() {
  const searchParams = useSearchParams();
  
  // Store hooks
  const games = useGames();
  const { isLoading: gamesLoading, error: gamesError } = useGamesStore();
  const { loadGames, setIds, setSearch, setCategories, clearFilters } = useGamesActions();
  const { centers, loadCenters, isLoading: centersLoading } = useCentersStore();
  const filteredGames = useFilteredGames();
  const availableCategories = useAvailableCategories();
  
  // Local state
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailability, setShowAvailability] = useState(false);

  // Handle URL parameters after centers are loaded
  useEffect(() => {
    const centerId = searchParams.get('centerId');
    console.log('🔗 Games page URL params:', { centerId, centersCount: centers.length });
    if (centerId && centers.length > 0) {
      console.log('✅ Setting selected center:', centerId);
      setSelectedCenter(centerId);
    }
  }, [searchParams, centers.length]);

  // Data is loaded globally by DataProvider - no need to load here
  // Only check once on mount
  useEffect(() => {
    if (games.length === 0) loadGames();
    if (centers.length === 0) loadCenters();
  }, []); // Empty dependency array - only run once

  // Handle center selection - this triggers availability display
  useEffect(() => {
    if (selectedCenter) {
      const center = centers.find(c => c.id === selectedCenter);
      const gameIds = center?.gameInstances?.map(gi => gi.gameId) || [];
      setIds(gameIds);
      setShowAvailability(true);
    } else {
      setIds([]);
      setShowAvailability(false);
    }
  }, [selectedCenter]); // Remove centers and setIds from deps

  // Handle search - debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchTerm);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle category filter
  useEffect(() => {
    setCategories(selectedCategory ? [selectedCategory] : []);
  }, [selectedCategory]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCenter('');
    setSelectedCategory('');
    setSearchTerm('');
    setShowAvailability(false);
    clearFilters();
  };


  // Only show loading if we have no data at all (first load)
  if ((gamesLoading && games.length === 0) || (centersLoading && centers.length === 0)) {
    return <LoadingPage title="טוען משחקים..." />;
  }

  if (gamesError) {
    return (
      <MainLayout>
        <ErrorPage 
          message={gamesError} 
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
                חיפוש משחק
              </label>
              <Input
                placeholder="שם משחק או תיאור..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מוקד <span className="text-xs text-gray-500">(לבדיקת זמינות)</span>
              </label>
              <Select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                options={[
                  { value: '', label: 'בחר מוקד לצפייה בזמינות' },
                  ...centers.map(center => ({
                    value: center.id,
                    label: `${center.name} - ${center.city}`
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה
              </label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as GameCategory | '')}
                options={[
                  { value: '', label: 'כל הקטגוריות' },
                  ...availableCategories.map(cat => ({
                    value: cat,
                    label: getCategoryLabel(cat)
                  }))
                ]}
              />
            </div>

            <div className="flex items-end space-x-2 space-x-reverse">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full"
              >
                נקה סינונים
              </Button>
            </div>
          </div>
          
          {selectedCenter && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                מציג רק משחקים זמינים במוקד: <strong>{centers.find(c => c.id === selectedCenter)?.name}</strong>
              </p>
            </div>
          )}
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
                      {showAvailability ? (
                        <GameAvailabilityDisplay 
                          gameId={game.id} 
                          selectedCenterId={selectedCenter} 
                          centers={centers}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">
                          בחר מוקד לבדיקת זמינות
                        </div>
                      )}
                      
                      <Link href={`/rent?gameId=${game.id}${selectedCenter ? `&centerId=${selectedCenter}` : ''}`}>
                        <Button size="sm">
                          השאל משחק
                        </Button>
                      </Link>
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

function getCategoryLabel(category: GameCategory): string {
  const labels: Record<GameCategory, string> = {
    COMMUNICATION: 'תקשורת',
    INTIMACY: 'אינטימיות',
    FUN: 'כיף ובידור',
    THERAPY: 'טיפול',
    PERSONAL_DEVELOPMENT: 'פיתוח אישי'
  };
  return labels[category] || category;
}

function getAudienceLabel(audience: TargetAudience): string {
  const labels: Record<TargetAudience, string> = {
    SINGLES: 'רווקים',
    MARRIED: 'נשואים',
    GENERAL: 'כלל הציבור'
  };
  return labels[audience] || audience;
}

// Game Availability Display Component
function GameAvailabilityDisplay({ 
  gameId, 
  selectedCenterId, 
  centers 
}: { 
  gameId: string;
  selectedCenterId: string;
  centers: CenterPublicInfo[];
}) {
  const selectedCenter = centers.find(c => c.id === selectedCenterId);
  const gameInstances = selectedCenter?.gameInstances?.filter(gi => gi.gameId === gameId) || [];
  
  if (gameInstances.length === 0) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm text-red-700 font-medium">
          לא זמין במוקד הנבחר
        </span>
      </div>
    );
  }
  
  // Group instances by status
  const statusCounts = gameInstances.reduce((acc, instance) => {
    acc[instance.status] = (acc[instance.status] || 0) + 1;
    return acc;
  }, {} as Record<GameInstanceStatus, number>);
  
  const availableCount = statusCounts.AVAILABLE || 0;
  const borrowedCount = statusCounts.BORROWED || 0;
  const unavailableCount = statusCounts.UNAVAILABLE || 0;
  
  return (
    <div className="space-y-1">
      {availableCount > 0 && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">
            {availableCount} זמין{availableCount > 1 ? 'ים' : ''}
          </span>
        </div>
      )}
      
      {borrowedCount > 0 && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm text-orange-700">
            {borrowedCount} מושאל{borrowedCount > 1 ? 'ים' : ''}
          </span>
        </div>
      )}
      
      {unavailableCount > 0 && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-sm text-gray-700">
            {unavailableCount} לא זמינים
          </span>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        סה"כ {gameInstances.length} עותק{gameInstances.length > 1 ? 'ים' : ''} במוקד
      </div>
    </div>
  );
}