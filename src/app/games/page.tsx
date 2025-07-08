'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorAlert } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Filter, Grid, List } from '@/components/icons';
import { GameCard } from './components/game-card';
import { GameFilters } from './components/game-filters';
import { GamesList } from './components/games-list';
import { useGamesStore } from '@/store/games-store';

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  imageUrl: string;
  availableCount: number;
  totalInstances: number;
  availableCenters: number;
}

interface FilterState {
  search: string;
  category: string;
  targetAudience: string;
}

export default function GamesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    filters,
    setFilters,
    getFilteredGames,
    loading,
    error
  } = useGamesStore();

  // Get filtered games from store
  const filteredGames = getFilteredGames();

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            קטלוג משחקי הזוגיות
          </h1>
          <p className="text-gray-600">
            גלו את המשחקים המושלמים לחיזוק הקשר בינכם
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="חפש משחק..."
                  value={filters.search}
                  onChange={(e) => {
                    const newFilters = { ...filters, search: e.target.value };
                    setFilters(newFilters);
                    // Update filters immediately for client-side filtering
                    handleFilterChange(newFilters);
                  }}
                  className="pr-10"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 ml-2" />
              מסננים
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <GameFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredGames.length > 0 ? (
              <>נמצאו {filteredGames.length} משחקים</>
            ) : (
              <>לא נמצאו משחקים</>
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <ErrorAlert
            message={error}
          />
        )}

        {/* Games Display */}
        {loading && filteredGames.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <GamesList games={filteredGames} />
        )}

        {/* Empty State */}
        {filteredGames.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              לא נמצאו משחקים התואמים לחיפוש
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const resetFilters = {
                  search: '',
                  category: '',
                  targetAudience: ''
                };
                handleFilterChange(resetFilters);
              }}
            >
              נקה מסננים
            </Button>
          </div>
        )}


      </div>
    </MainLayout>
  );
}