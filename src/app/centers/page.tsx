'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorAlert } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, MapPin, Phone, Filter, Map, List } from '@/components/icons';
import { CenterCard } from './components/center-card';
import { CentersList } from './components/centers-list';
import { CenterFilters } from './components/center-filters';
import { useCentersStore } from '@/store/centers-store';

interface Center {
  id: string;
  name: string;
  city: string;
  area: string;
  location: any; // JSON field
  coordinator: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
  } | null;
  superCoordinator: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
  } | null;
  stats: {
    totalGames: number;
    activeRentals: number;
  };
}

interface FilterState {
  search: string;
  area: string;
  city: string;
}

export default function CentersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    filters,
    setFilters,
    getFilteredCenters,
    loading,
    error
  } = useCentersStore();

  // Get filtered centers from store
  const filteredCenters = getFilteredCenters();

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            מוקדי זוגיות
          </h1>
          <p className="text-gray-600">
            מצאו את המוקד הקרוב אליכם והכירו את הרכזים
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
                  placeholder="חפש מוקד, עיר או אזור..."
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
                <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
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
            <CenterFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredCenters.length > 0 ? (
              <>נמצאו {filteredCenters.length} מוקדים</>
            ) : (
              <>לא נמצאו מוקדים</>
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <ErrorAlert
            message={error}
          />
        )}

        {/* Centers Display */}
        {loading && filteredCenters.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : viewMode === 'map' ? (
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">מפה אינטראקטיבית בפיתוח</p>
              <p className="text-sm text-gray-500">תתווסף בקרוב עם Google Maps</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <CenterCard key={center.id} center={center} />
            ))}
          </div>
        ) : (
          <CentersList centers={filteredCenters} />
        )}

        {/* Empty State */}
        {filteredCenters.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              לא נמצאו מוקדים התואמים לחיפוש
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const resetFilters = {
                  search: '',
                  area: '',
                  city: ''
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