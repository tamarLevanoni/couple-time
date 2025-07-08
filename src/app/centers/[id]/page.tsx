'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  User, 
  GameController, 
  Calendar,
  Mail
} from '@/components/icons';
import { useCentersStore } from '@/store/centers-store';

const areaLabels = {
  JERUSALEM: 'ירושלים',
  CENTER: 'מרכז',
  NORTH: 'צפון',
  SOUTH: 'דרום',
  JUDEA_SAMARIA: 'יהודה ושומרון'
};

const categoryLabels = {
  COMMUNICATION: 'תקשורת',
  INTIMACY: 'אינטימיות',
  FUN: 'כיף',
  THERAPY: 'טיפול',
  PERSONAL_DEVELOPMENT: 'התפתחות אישית'
};

export default function CenterPage() {
  const params = useParams();
  const { getCenterById, loading, error } = useCentersStore();

  const centerId = params.id as string;

  const center = useMemo(() => {
    return getCenterById(centerId);
  }, [centerId, getCenterById]);

  if (error) {
    return (
      <ErrorPage
        title="שגיאה בטעינת המוקד"
        message={error}
        action={{
          label: "חזור למוקדים",
          onClick: () => window.location.href = "/centers"
        }}
      />
    );
  }

  // Show loading state only if data is still loading AND no center found
  if (loading && !center) {
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

  if (!loading && !center) {
    return (
      <ErrorPage
        title="מוקד לא נמצא"
        message="המוקד המבוקש לא נמצא במערכת"
        action={{
          label: "חזור למוקדים", 
          onClick: () => window.location.href = "/centers"
        }}
      />
    );
  }

  const whatsappUrl = center?.coordinator?.phone ? `https://wa.me/972${center.coordinator.phone.replace(/[^0-9]/g, '').substring(1)}?text=${encodeURIComponent('שלום, אני מעוניין/ת במידע על השאלת משחקי זוגיות')}` : '';
  const phoneUrl = center?.coordinator?.phone ? `tel:${center.coordinator.phone}` : '';
  const coordinatorEmail = center?.coordinator?.email;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/centers" className="hover:text-primary">
              מוקדי זוגיות
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-gray-900">{center.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {center.name}
              </h1>

              {/* Location Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{center.city}, {areaLabels[center.area as keyof typeof areaLabels] || center.area}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  פרטי קשר
                </h2>
                
                {center?.coordinator && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">רכז המוקד</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{center.coordinator.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{center.coordinator.email}</span>
                      </div>
                      {center.coordinator.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{center.coordinator.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {center.superCoordinator && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">רכז-על</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-blue-500" />
                        <span>{center.superCoordinator.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>{center.superCoordinator.email}</span>
                      </div>
                      {center.superCoordinator.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>{center.superCoordinator.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Actions */}
              {center?.coordinator && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <a
                    href={`mailto:${coordinatorEmail}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 ml-2" />
                      שלח אימייל
                    </Button>
                  </a>
                  
                  {center.coordinator.phone && (
                    <>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          פנה בוואצאפ
                        </Button>
                      </a>
                      <a href={phoneUrl} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Phone className="h-4 w-4 ml-2" />
                          התקשר
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Games List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                משחקים זמינים במוקד
              </h2>

              {center.games.length > 0 ? (
                <div className="space-y-4">
                  {center.games.map((gameData) => (
                    <div
                      key={gameData.game.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {gameData.game.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {gameData.game.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{categoryLabels[gameData.game.category as keyof typeof categoryLabels] || gameData.game.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${gameData.availableCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gameData.availableCount} זמין
                          </div>
                          <div className="text-xs text-gray-500">
                            מתוך {gameData.totalCount}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Link href={`/games/${gameData.game.id}`}>
                          <Button variant="outline" size="sm">
                            פרטי משחק
                          </Button>
                        </Link>
                        
                        {gameData.availableCount > 0 && (
                          <Link href={`/games/${gameData.game.id}?action=rent`}>
                            <Button size="sm">
                              השאל עכשיו
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GameController className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>אין משחקים זמינים במוקד זה כעת</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">סטטיסטיקות</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GameController className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">סה&quot;כ משחקים</span>
                    </div>
                    <span className="font-medium text-blue-600">{center.stats.totalGames}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">זמינים</span>
                    </div>
                    <span className="font-medium text-green-600">{center.stats.availableGames}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">השאלות פעילות</span>
                    </div>
                    <span className="font-medium text-orange-600">{center.stats.activeRentals}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
                <div className="space-y-3">
                  <Link href="/games" className="block">
                    <Button variant="outline" className="w-full">
                      עיין בכל המשחקים
                    </Button>
                  </Link>
                  
                  <Link href="/centers" className="block">
                    <Button variant="outline" className="w-full">
                      מוקדים נוספים
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}