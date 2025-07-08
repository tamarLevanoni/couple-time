'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  ArrowRight, 
  Users, 
  Heart, 
  Phone,
  MapPin
} from '@/components/icons';
import { RentalRequestModal } from './components/rental-request-modal';
import { useGamesStore } from '@/store/games-store';

// Remove local interface - we'll use the one from the store

const categoryLabels = {
  COMMUNICATION: 'תקשורת',
  INTIMACY: 'אינטימיות',
  FUN: 'כיף',
  THERAPY: 'טיפול',
  PERSONAL_DEVELOPMENT: 'התפתחות אישית'
};

const audienceLabels = {
  SINGLES: 'רווקים',
  MARRIED: 'נשואים',
  GENERAL: 'כללי'
};

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { getGameById, loading, error } = useGamesStore();
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const gameId = params.id as string;
  const shouldShowRentalModal = searchParams.get('action') === 'rent';

  const game = useMemo(() => {
    return getGameById(gameId);
  }, [gameId, getGameById]);

  const availableCenters = game?.centerAvailability.filter(ca => ca.available > 0) || [];
  const selectedCenter = availableCenters.find(ca => ca.center.id === selectedLocationId);

  // Reset selection when game changes
  useEffect(() => {
    setSelectedLocationId('');
  }, [gameId]);

  // Auto-open rental modal if requested
  useEffect(() => {
    if (shouldShowRentalModal && game && game.availableCount > 0) {
      setShowRentalModal(true);
    }
  }, [shouldShowRentalModal, game]);

  if (error) {
    return (
      <ErrorPage
        title="שגיאה בטעינת המשחק"
        message={error}
        action={{
          label: "חזור לקטלוג",
          onClick: () => window.location.href = "/games"
        }}
      />
    );
  }

  if (!loading && !game) {
    return (
      <ErrorPage
        title="משחק לא נמצא"
        message="המשחק המבוקש לא נמצא במערכת"
        action={{
          label: "חזור לקטלוג",
          onClick: () => window.location.href = "/games"
        }}
      />
    );
  }

  // Show loading state only if data is still loading AND no game found
  if (loading && !game) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  const isAvailable = (game?.availableCount || 0) > 0;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/games" className="hover:text-primary">
              קטלוג משחקים
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-gray-900">{game?.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {game?.imageUrl ? (
                  <Image
                    src={game.imageUrl}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                    <Heart className="h-16 w-16 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                {isAvailable ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setShowRentalModal(true)}
                  >
                    השאל עכשיו
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    לא זמין כעת
                  </Button>
                )}

                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    זמינות: {game?.availableCount || 0} מתוך {game?.totalInstances || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    ב-{availableCenters.length} מוקדים
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {game?.name}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {game?.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>{categoryLabels[game?.category as keyof typeof categoryLabels] || game?.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{audienceLabels[game?.targetAudience as keyof typeof audienceLabels] || game?.targetAudience}</span>
                </div>
                
              </div>
            </div>


            {/* Location Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                בחירת מוקד
              </h2>
              
              {availableCenters.length > 0 ? (
                <div className="space-y-4">
                  {/* Location Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      בחר מוקד להשאלה
                    </label>
                    <Select
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      options={availableCenters.map(ca => ({
                        value: ca.center.id,
                        label: `${ca.center.name} - ${ca.center.city} (${ca.available} זמין)`
                      }))}
                      placeholder="בחר מוקד"
                      required
                    />
                  </div>

                  {/* Selected Center Details */}
                  {selectedCenter ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedCenter.center.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{selectedCenter.center.city}, {selectedCenter.center.area}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            {selectedCenter.available} זמין
                          </div>
                          <div className="text-xs text-gray-500">
                            מתוך {selectedCenter.total}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{selectedCenter.center.coordinator?.name}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedCenter.center.coordinator?.phone}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/centers/${selectedCenter.center.id}`}>
                            <Button variant="outline" size="sm">
                              פרטי מוקד
                            </Button>
                          </Link>
                          
                          {selectedCenter.available > 0 && (
                            <Button
                              size="sm"
                              onClick={() => setShowRentalModal(true)}
                            >
                              השאל במוקד זה
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        בחר מוקד כדי לראות פרטי זמינות והשאלה
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    המשחק אינו זמין כעת באף מוקד
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    ניתן לפנות למוקדים ישירות לבירור זמינות עתידית
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rental Request Modal */}
        {showRentalModal && game && (
          <RentalRequestModal
            game={game}
            isOpen={showRentalModal}
            onClose={() => setShowRentalModal(false)}
          />
        )}
      </div>
    </MainLayout>
  );
}