'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AuthPopupContainer } from '@/components/auth/auth-popup-container';
import { GameController, MapPin, Calendar, AlertCircle } from '@/components/icons';
import { 
  useGamesStore, 
  useCentersStore, 
  useRentalsStore,
  useAuthStore
} from '@/store';
import { GameBasic, CenterPublicInfo } from '@/types';

export default function RentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // Store hooks
  const { games, loadGames, isLoading: gamesLoading, error: gamesError } = useGamesStore();
  const { centers, loadCenters, isLoading: centersLoading, error: centersError } = useCentersStore();
  const { createRental, isSubmitting, error: rentalError } = useRentalsStore();
  const { openAuthPopup } = useAuthStore();
  
  // Form state
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  
  // Pre-filled from URL params - wait for data to be loaded
  useEffect(() => {
    const gameId = searchParams.get('gameId');
    const centerId = searchParams.get('centerId');
    
    console.log('🔗 Rent page URL params:', { 
      gameId, 
      centerId, 
      gamesCount: games.length, 
      centersCount: centers.length,
      currentSelectedGames: selectedGameIds,
      currentSelectedCenter: selectedCenterId
    });
    
    if (gameId && games.length > 0) {
      const gameExists = games.find(g => g.id === gameId);
      console.log('🎮 Game lookup:', { gameId, gameExists: !!gameExists, gameName: gameExists?.name });
      if (gameExists) {
        console.log('✅ Setting selected game:', gameId);
        setSelectedGameIds([gameId]);
      } else {
        console.log('❌ Game not found in available games');
      }
    }
    
    if (centerId && centers.length > 0) {
      const centerExists = centers.find(c => c.id === centerId);
      console.log('🏢 Center lookup:', { centerId, centerExists: !!centerExists, centerName: centerExists?.name });
      if (centerExists) {
        console.log('✅ Setting selected center:', centerId);
        setSelectedCenterId(centerId);
      } else {
        console.log('❌ Center not found in available centers');
      }
    }
  }, []);
  
  useEffect(() => {
    const gameId = searchParams.get('gameId');
    const centerId = searchParams.get('centerId');
    
    console.log('🔗 Rent page URL params:', { 
      gameId, 
      centerId, 
      gamesCount: games.length, 
      centersCount: centers.length,
      currentSelectedGames: selectedGameIds,
      currentSelectedCenter: selectedCenterId
    });
    
    if (gameId && games.length > 0) {
      const gameExists = games.find(g => g.id === gameId);
      console.log('🎮 Game lookup:', { gameId, gameExists: !!gameExists, gameName: gameExists?.name });
      if (gameExists) {
        console.log('✅ Setting selected game:', gameId);
        setSelectedGameIds([gameId]);
      } else {
        console.log('❌ Game not found in available games');
      }
    }
    
    if (centerId && centers.length > 0) {
      const centerExists = centers.find(c => c.id === centerId);
      console.log('🏢 Center lookup:', { centerId, centerExists: !!centerExists, centerName: centerExists?.name });
      if (centerExists) {
        console.log('✅ Setting selected center:', centerId);
        setSelectedCenterId(centerId);
      } else {
        console.log('❌ Center not found in available centers');
      }
    }
  }, [searchParams, games.length, centers.length]);
  
  // Data is loaded globally by DataProvider - no need to load here
  // Only check once on mount
  useEffect(() => {
    if (games.length === 0) loadGames();
    if (centers.length === 0) loadCenters();
  }, []); // Empty dependency array - only run once
  
  // Get selected objects - use useMemo to ensure proper updates
  const selectedGames = useMemo(() => {
    return games.filter(g => selectedGameIds.includes(g.id));
  }, [games, selectedGameIds]);
  
  const selectedCenter = useMemo(() => {
    return centers.find(c => c.id === selectedCenterId);
  }, [centers, selectedCenterId]);
  
  // Get filtered centers and games based on selection
  // Include URL parameter selections even if not perfectly compatible
  // const urlGameId = searchParams.get('gameId');
  // const urlCenterId = searchParams.get('centerId');
  
  const filteredCenters = selectedGameIds.length > 0
    ? centers.filter(center => 
        selectedGameIds.every(gameId => 
          center.gameInstances?.some(gi => gi.gameId === gameId)
        )
      )
    : centers;
  
  // Always include the URL parameter center if present
  // const availableCenters = urlCenterId && centers.find(c => c.id === urlCenterId)
  //   ? [...new Set([...filteredCenters, centers.find(c => c.id === urlCenterId)!])]
  //   : filteredCenters;
  const availableCenters = filteredCenters;
  
  const filteredGames = selectedCenterId
    ? games.filter(game => {
        const selectedCenterData = centers.find(c => c.id === selectedCenterId);
        return selectedCenterData?.gameInstances?.some(gi => 
          gi.gameId === game.id
        );
      })
    : games;
    
  // Always include the URL parameter game if present  
  // const availableGames = urlGameId && games.find(g => g.id === urlGameId)
  //   ? [...new Set([...filteredGames, games.find(g => g.id === urlGameId)!])]
  //   : filteredGames;
  const availableGames = filteredGames;

  // Don't auto-clear selections for now to avoid interference with URL params
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Validate required fields
    if (selectedGameIds.length === 0 || !selectedCenterId) {
      setFormError('אנא בחר לפחות משחק אחד ומוקד');
      return;
    }
    
    // Check if user is authenticated
    if (status === 'loading') {
      return; // Still checking auth status
    }
    
    if (!session) {
      // Open auth popup and preserve form data
      openAuthPopup('login');
      return;
    }
    
    try {
      // Find all game instances at selected center for selected games
      const selectedCenterData = centers.find(c => c.id === selectedCenterId);
      const gameInstances = selectedGameIds.map(gameId => {
        return selectedCenterData?.gameInstances?.find(gi => gi.gameId === gameId);
      }).filter(Boolean);
      
      if (gameInstances.length !== selectedGameIds.length) {
        const missingGames = selectedGameIds.filter(gameId => 
          !selectedCenterData?.gameInstances?.some(gi => gi.gameId === gameId)
        );
        const missingGameNames = missingGames.map(gameId => 
          games.find(g => g.id === gameId)?.name || gameId
        ).join(', ');
        setFormError(`המשחקים הבאים לא קיימים במוקד הנבחר: ${missingGameNames}`);
        return;
      }
      
      // Add notes about current status for unavailable games
      let finalNotes = notes.trim();
      const statusNotes: string[] = [];
      
      gameInstances.forEach(instance => {
        const gameName = games.find(g => g.id === instance?.gameId)?.name || 'משחק';
        if (instance?.status === 'BORROWED') {
          statusNotes.push(`${gameName} כרגע מושאל - בקשה לרשימת המתנה`);
        } else if (instance?.status === 'UNAVAILABLE') {
          statusNotes.push(`${gameName} כרגע לא זמין - בקשה לרשימת המתנה`);
        }
      });
      
      if (statusNotes.length > 0) {
        const statusText = statusNotes.join('\n');
        finalNotes = finalNotes ? `${finalNotes}\n\n${statusText}` : statusText;
      }
      
      await createRental({
        centerId: selectedCenterId,
        gameInstanceIds: gameInstances.map(gi => gi!.id),
        notes: finalNotes || undefined
      });
      
      // Redirect to confirmation (will be handled by success state)
      router.push('/my-rentals?success=rental-created');
    } catch (error) {
      console.error('Rental creation failed:', error);
      setFormError('שגיאה ביצירת הבקשה. אנא נסו שוב.');
    }
  };
  
  // Loading states - only show loading if we have no data at all
  const isLoading = status === 'loading' || (gamesLoading && games.length === 0) || (centersLoading && centers.length === 0);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Game Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    בחר משחקים <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-60 overflow-y-auto">
                    {availableGames.length === 0 ? (
                      <p className="text-gray-500 text-sm">אין משחקים זמינים</p>
                    ) : (
                      <>
                        {/* Select All / Clear All */}
                        {availableGames.length > 1 && (
                          <div className="border-b border-gray-200 pb-2 mb-2">
                            <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedGameIds.length === availableGames.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGameIds(availableGames.map(g => g.id));
                                  } else {
                                    setSelectedGameIds([]);
                                  }
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {selectedGameIds.length === availableGames.length ? 'בטל בחירת הכל' : 'בחר הכל'}
                              </span>
                            </label>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {availableGames.map(game => (
                            <label key={game.id} className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedGameIds.includes(game.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGameIds([...selectedGameIds, game.id]);
                                  } else {
                                    setSelectedGameIds(selectedGameIds.filter(id => id !== game.id));
                                  }
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{game.name}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {selectedGameIds.length > 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      נבחרו {selectedGameIds.length} משחקים
                    </p>
                  )}
                </div>

                {/* Center Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    בחר מוקד <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedCenterId}
                    onChange={(e) => setSelectedCenterId(e.target.value)}
                    options={[
                      { 
                        value: '', 
                        label:'בחר מוקד...' 
                      },
                      ...availableCenters.map(center => ({
                        value: center.id,
                        label: `${center.name} - ${center.city}`
                      }))
                    ]}
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הערות (אופציונלי)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="הערות נוספות לרכז המוקד..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Error Display */}
                {(formError || rentalError) && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                    <p className="text-sm text-red-700">
                      {formError || rentalError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || selectedGameIds.length === 0 || !selectedCenterId}
                  className="w-full"
                >
                  {isSubmitting ? 'שולח בקשה...' : 
                   !session ? 'התחבר ושלח בקשה' : 'שלח בקשת השאלה'}
                </Button>

                {!session && (
                  <p className="text-sm text-gray-600 text-center">
                    תצטרכו להתחבר או להירשם כדי לשלוח את הבקשה
                  </p>
                )}
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Games Info */}
            {selectedGames.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center mb-3">
                  <GameController className="h-5 w-5 text-primary ml-2" />
                  <h3 className="font-semibold text-gray-900">
                    משחקים נבחרים ({selectedGames.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {selectedGames.map(game => (
                    <div key={game.id} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{game.name}</p>
                        <div className="text-xs text-gray-500">
                          {game.categories.map(cat => getCategoryLabel(cat)).join(' • ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Selected Center Info */}
            {selectedCenter && (
              <Card className="p-4">
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 text-primary ml-2" />
                  <h3 className="font-semibold text-gray-900">מוקד נבחר</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{selectedCenter.name}</p>
                  <p className="text-gray-600">{selectedCenter.city}</p>
                  {selectedCenter.coordinator?.name && (
                    <p className="text-gray-600">
                      רכז: {selectedCenter.coordinator.name}
                    </p>
                  )}
                  {selectedCenter.coordinator?.phone && (
                    <p className="text-gray-600">
                      טלפון: {selectedCenter.coordinator.phone}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Process Info */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center mb-3">
                <Calendar className="h-5 w-5 text-blue-600 ml-2" />
                <h3 className="font-semibold text-blue-900">איך זה עובד?</h3>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <p>1. בחרו משחק ומוקד</p>
                <p>2. שלחו בקשה (נדרשת הרשמה)</p>
                <p>3. הרכז יאשר ויתאם איסוף</p>
                <p>4. איסוף המשחק מהמוקד</p>
                <p>5. החזרה תוך שבוע</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Auth Popup */}
      <AuthPopupContainer />
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