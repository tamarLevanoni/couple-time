'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  useAvailableCategories
} from '@/store';
import { GameBasic, GameCategory, TargetAudience, CenterPublicInfo, GameInstanceStatus } from '@/types';

export function GamesContent() {
  const searchParams = useSearchParams();
  
  // Store hooks
  const games = useGames();
  const { isLoading: gamesLoading, error: gamesError } = useGamesStore();
  const { setIds, setSearch, setCategories, clearFilters } = useGamesActions();
  const { centers, isLoading: centersLoading } = useCentersStore();
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

  // Update filters when local state changes
  useEffect(() => {
    setSearch(searchTerm);
  }, [searchTerm, setSearch]);
  
  useEffect(() => {
    if (selectedCategory) {
      setCategories([selectedCategory]);
    } else {
      setCategories([]);
    }
  }, [selectedCategory, setCategories]);
  
  // Filter by center
  const finalGames = selectedCenter 
    ? filteredGames.filter(game => {
        const center = centers.find(c => c.id === selectedCenter);
        return center?.gameInstances?.some(gi => gi.gameId === game.id);
      })
    : filteredGames;

  // Category labels
  const getCategoryLabel = (category: GameCategory): string => {
    const labels: Record<GameCategory, string> = {
      COMMUNICATION: 'תקשורת',
      INTIMACY: 'אינטימיות', 
      FUN: 'כיף ובידור',
      THERAPY: 'טיפול',
      PERSONAL_DEVELOPMENT: 'פיתוח אישי'
    };
    return labels[category];
  };

  // Target audience labels
  const getAudienceLabel = (audience: TargetAudience): string => {
    const labels: Record<TargetAudience, string> = {
      SINGLES: 'רווקים',
      MARRIED: 'נשואים',
      GENERAL: 'כלל הציבור'
    };
    return labels[audience];
  };

  // Game instance status counts for a game at a specific center
  const getGameStatusAtCenter = (gameId: string, centerId: string) => {
    const center = centers.find(c => c.id === centerId);
    const instances = center?.gameInstances?.filter(gi => gi.gameId === gameId) || [];
    
    return {
      total: instances.length,
      available: instances.filter(gi => gi.status === 'AVAILABLE').length,
      borrowed: instances.filter(gi => gi.status === 'BORROWED').length,
      unavailable: instances.filter(gi => gi.status === 'UNAVAILABLE').length
    };
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCenter('');
    setSelectedCategory('');
    setSearchTerm('');
    setShowAvailability(false);
    clearFilters();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              חיפוש משחק
            </label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="הקלד שם משחק..."
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קטגוריה
            </label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GameCategory | '')}
              options={[
                { value: '', label: 'כל הקטגוריות' },
                ...availableCategories.map(category => ({
                  value: category,
                  label: getCategoryLabel(category)
                }))
              ]}
            />
          </div>

          {/* Center Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מוקד
            </label>
            <Select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              options={[
                { value: '', label: 'כל המוקדים' },
                ...centers.map(center => ({
                  value: center.id,
                  label: `${center.name} - ${center.city}`
                }))
              ]}
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button 
              onClick={handleClearFilters}
              variant="outline"
              className="w-full"
            >
              נקה מסננים
            </Button>
          </div>
        </div>

        {/* Show availability toggle */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={showAvailability}
              onChange={(e) => setShowAvailability(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              הצג זמינות משחקים במוקדים
            </span>
          </label>
        </div>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            משחקים ({finalGames.length})
          </h2>
        </div>

        {finalGames.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">לא נמצאו משחקים</p>
            <p className="text-gray-400 text-sm">נסו לשנות את המסננים או לחפש משהו אחר</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalGames.map(game => (
              <Card key={game.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Game Info */}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {game.name}
                    </h3>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {game.categories.map(category => (
                        <span
                          key={category}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {getCategoryLabel(category)}
                        </span>
                      ))}
                    </div>

                    {/* Target Audiences */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.targetAudiences.map(audience => (
                        <span
                          key={audience}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                        >
                          {getAudienceLabel(audience)}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    {game.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {game.description}
                      </p>
                    )}
                  </div>

                  {/* Availability at selected center */}
                  {selectedCenter && showAvailability && (
                    <div className="border-t border-gray-200 pt-3">
                      {(() => {
                        const status = getGameStatusAtCenter(game.id, selectedCenter);
                        const selectedCenterName = centers.find(c => c.id === selectedCenter)?.name;
                        
                        if (status.total === 0) {
                          return (
                            <p className="text-sm text-gray-500">
                              לא זמין ב{selectedCenterName}
                            </p>
                          );
                        }
                        
                        return (
                          <div className="text-sm">
                            <p className="font-medium text-gray-700 mb-1">
                              זמינות ב{selectedCenterName}:
                            </p>
                            <div className="space-y-1">
                              {status.available > 0 && (
                                <p className="text-green-600">
                                  ✓ זמין ({status.available} יחידות)
                                </p>
                              )}
                              {status.borrowed > 0 && (
                                <p className="text-orange-600">
                                  ⊗ מושאל ({status.borrowed} יחידות)
                                </p>
                              )}
                              {status.unavailable > 0 && (
                                <p className="text-red-600">
                                  ✗ לא זמין ({status.unavailable} יחידות)
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Action */}
                  <div className="pt-2">
                    <Link
                      href={`/rent?gameId=${game.id}${selectedCenter ? `&centerId=${selectedCenter}` : ''}`}
                      className="block"
                    >
                      <Button className="w-full" size="sm">
                        בקש השאלה
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}