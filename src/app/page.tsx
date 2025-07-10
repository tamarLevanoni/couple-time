'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Shield } from '@/components/icons';
import { Role } from '@/types/database';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingPage title="טוען את המערכת..." />;
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                <span className="text-primary">זמן זוגי</span>
                <br />
                משחקי זוגיות להשאלה
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                גלו משחקי זוגיות איכותיים המיועדים לחיזוק הקשר בינכם. 
                השאילו משחקים ממרכזי זוגיות ברחבי הארץ בקלות ובנוחות.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {session ? (
                  <div className="space-y-4 text-center">
                    <p className="text-lg text-gray-700">
                      שלום {session.user.name}! 👋
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button size="lg">
                        <Link href="/games">עיין במשחקים</Link>
                      </Button>
                      {(session.user.roles?.includes(Role.CENTER_COORDINATOR) || 
                        session.user.roles?.includes(Role.SUPER_COORDINATOR) || 
                        session.user.roles?.includes(Role.ADMIN)) && (
                        <Button variant="outline" size="lg">
                          <Link href="/dashboard">לוח בקרה</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg">
                      <Link href="/auth/signup">הירשם עכשיו</Link>
                    </Button>
                    <Button variant="outline" size="lg">
                      <Link href="/auth/signin">התחבר</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                למה לבחור בזמן זוגי?
              </h2>
              <p className="text-lg text-gray-600">
                מערכת מתקדמת להשאלת משחקי זוגיות עם שירות מקצועי
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  חיפוש קל ונוח
                </h3>
                <p className="text-gray-600">
                  מצאו בקלות את המשחק המושלם עבורכם מתוך מגוון רחב של משחקי זוגיות איכותיים.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  מרכזים ברחבי הארץ
                </h3>
                <p className="text-gray-600">
                  השאילו משחקים ממרכזי זוגיות מקצועיים הפרוסים ברחבי הארץ עם שירות אישי.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  בטוח ומוגן
                </h3>
                <p className="text-gray-600">
                  המערכת מאובטחת ומוגנת, עם ניהול מקצועי של בקשות השאלה והחזרה.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                מוכנים להתחיל?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                הצטרפו אלינו וגלו עולם של משחקי זוגיות מרתקים
              </p>
              {!session && (
                <Button variant="secondary" size="lg">
                  <Link href="/auth/signup">הצטרפו עכשיו בחינם</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}