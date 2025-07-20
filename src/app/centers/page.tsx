'use client';

import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin } from '@/components/icons';
import { useCentersStore, useFilteredCenters, useAvailableCities } from '@/store';

export default function CentersPage() {
  const { 
    centers,
    isLoading, 
    error,
    searchTerm,
    selectedCity,
    loadCenters,
    setSearch,
    setCity,
    clearFilters
  } = useCentersStore();

  const filteredCenters = useFilteredCenters();
  const availableCities = useAvailableCities();


  if (isLoading) {
    return <LoadingPage title="טוען מוקדים..." />;
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorPage 
          message={error} 
          action={{
            label: 'נסה שוב',
            onClick: loadCenters
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
            מוקדי השאלה
          </h1>
          <p className="text-lg text-gray-600">
            מצאו את המוקד הקרוב אליכם להשאלת משחקי זוגיות
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                חיפוש
              </label>
              <Input
                placeholder="חפש מוקד..."
                value={searchTerm || ''}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                עיר
              </label>
              <Select
                value={selectedCity || ''}
                onChange={(e) => setCity(e.target.value || null)}
                options={[
                  { value: '', label: 'כל הערים' },
                  ...availableCities.map(city => ({
                    value: city,
                    label: city
                  }))
                ]}
              />
            </div>

            <div className="flex items-end">
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

        {/* Centers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">לא נמצאו מוקדים מתאימים</p>
            </div>
          ) : (
            filteredCenters.map((center) => (
              <Card key={center.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {center.name}
                    </h3>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>


                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">עיר:</span>
                      <span>{center.city}</span>
                    </div>
                    
                    {center.coordinator?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium ml-2">טלפון:</span>
                        <span>{center.coordinator.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {center.gameInstances && center.gameInstances.length > 0 ? (
                          `${center.gameInstances.length} משחקים זמינים`
                        ) : (
                          'אין משחקים זמינים כרגע'
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          ראה משחקים
                        </Button>
                        
                        {center.coordinator?.phone && (
                          <Button 
                            size="sm"
                            onClick={() => window.open(`tel:${center.coordinator?.phone}`)}
                          >
                            התקשר
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-600">
          מציג {filteredCenters.length} מתוך {centers.length} מוקדים
        </div>

        {/* Map Placeholder */}
        <div className="mt-12 bg-gray-100 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            מפת מוקדים
          </h3>
          <p className="text-gray-600">
            בקרוב: מפה אינטראקטיבית עם מיקום כל המוקדים
          </p>
        </div>
      </div>
    </MainLayout>
  );
}