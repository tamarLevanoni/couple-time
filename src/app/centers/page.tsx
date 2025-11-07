'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, GameController } from '@/components/icons';
import { useCentersStore, useFilteredCenters, useAvailableCities, useAuthStore } from '@/store';
import { Area } from '@/types';
import { formatUserName } from '@/lib/utils';
import { getAreaLabel } from '@/lib/game-labels';

export default function CentersPage() {
  const {
    centers,
    isLoading,
    error,
    loadCenters,
    setArea,
    setCity,
    setSearch,
    clearFilters
  } = useCentersStore();

  const { isAuthenticated } = useAuthStore();

  const filteredCenters = useFilteredCenters();
  const availableCities = useAvailableCities();
  
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | ''>('');
  const [selectedCity, setSelectedCity] = useState('');
  
  
  // Handle filter changes - debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchTerm);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  useEffect(() => {
    setArea(selectedArea || null);
  }, [selectedArea]);
  
  useEffect(() => {
    setCity(selectedCity || null);
  }, [selectedCity]);
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedArea('');
    setSelectedCity('');
    clearFilters();
  };
  
  // Get unique areas from centers
  const availableAreas = Array.from(new Set(centers.map(c => c.area)));


  // Only show loading if we have no data at all (first load)
  if (isLoading && centers.length === 0) {
    return <LoadingPage title="טוען מוקדים..." />;
  }

  if (error) {
    return (
      
        <ErrorPage 
          message={error} 
          action={{
            label: 'נסה שוב',
            onClick: loadCenters
          }}
        />
      
    );
  }

  return (
    
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                חיפוש מוקד
              </label>
              <Input
                placeholder="שם מוקד או עיר..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אזור
              </label>
              <Select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as Area | '')}
                options={[
                  { value: '', label: 'כל האזורים' },
                  ...availableAreas.map(area => ({
                    value: area,
                    label: getAreaLabel(area)
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                עיר
              </label>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                options={[
                  { value: '', label: 'כל הערים' },
                  ...availableCities
                    .filter(city => !selectedArea || centers.some(c => c.city === city && c.area === selectedArea))
                    .map(city => ({
                      value: city,
                      label: city
                    }))
                ]}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
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
                      <MapPin className="h-4 w-4 ml-2" />
                      <span className="font-medium ml-2">אזור:</span>
                      <span>{getAreaLabel(center.area)}</span>
                      <span className="mx-2">•</span>
                      <span>{center.city}</span>
                    </div>
                    
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium ml-2">רכז:</span>
                      <span>{formatUserName(center.coordinator?.firstName,center.coordinator?.lastName)}</span>
                      {center.coordinator?.phone && (
                        <>
                          <span className="mx-2">•</span>
                          <Phone className="h-3 w-3 ml-1" />
                          <span>
                            {isAuthenticated ? center.coordinator.phone : 'אנא התחבר כדי לראות את מספר הטלפון'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <GameController className="h-4 w-4 ml-2" />
                        {center.gameInstances && center.gameInstances.length > 0 ? (
                          <span className="text-green-600 font-medium">
                            {center.gameInstances.length} משחקים זמינים
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            אין משחקים זמינים כרגע
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Link href={`/games?centerId=${center.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={!center.gameInstances?.length}
                          >
                            ראה משחקים
                          </Button>
                        </Link>
                        
                        {center.coordinator?.phone ? (
                          <Button
                            size="sm"
                            disabled={!isAuthenticated}
                            onClick={() => {
                              if (isAuthenticated) {
                                const message = encodeURIComponent(`שלום! אני מעוניין להשאיל משחק מהמוקד ${center.name}`);
                                window.open(`https://wa.me/972${center.coordinator?.phone?.replace(/^0/, '')}?text=${message}`);
                              }
                            }}
                          >
                            {isAuthenticated ? 'שלח וואצאפ' : 'התחבר לשליחת וואצאפ'}
                          </Button>
                        ) : (
                          <Button size="sm" disabled>
                            אין פרטי קשר
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

        {/* Call to Action */}
        {filteredCenters.length > 0 && (
          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              מצאתם מוקד מתאים?
            </h3>
            <p className="text-gray-700 mb-4">
              עיינו במשחקים הזמינים או צרו קשר ישירות עם הרכז
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Link href="/games">
                <Button variant="outline">
                  ראה כל המשחקים
                </Button>
              </Link>
              <Link href="/rent">
                <Button>
                  השאל משחק עכשיו
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

  );
}