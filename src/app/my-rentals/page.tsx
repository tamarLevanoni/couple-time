'use client';

import { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  useRentalsStore
} from '@/store';
import { MyRentalsContent } from '@/components/rentals/my-rentals-content';

function MyRentalsPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { 
    isLoading, 
    error,
    loadUserRentals 
  } = useRentalsStore();

  // Loading state for authentication
  if (status === 'loading') {
    return <LoadingPage title="טוען..." />;
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated' || !session) {
    return (
      
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              נדרשת התחברות
            </h1>
            <p className="text-gray-600 mb-6">
              כדי לצפות בבקשות השאלה שלכם, עליכם להתחבר למערכת
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/api/auth/signin')}
                size="lg"
                className="w-full"
              >
                התחבר למערכת
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="lg" 
                className="w-full"
              >
                חזור לדף הבית
              </Button>
            </div>
          </Card>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorPage 
            message={error} 
            action={{
              label: 'נסה שוב',
              onClick: loadUserRentals
            }}
          />
        </div>
      
    );
  }

  return (
    
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            הבקשות שלי
          </h1>
          <p className="text-lg text-gray-600">
            כאן תוכלו לעקוב אחר בקשות ההשאלה שלכם
          </p>
        </div>

        <Suspense fallback={<LoadingPage title="טוען בקשות..." />}>
          <MyRentalsContent />
        </Suspense>
      </div>
    
  );
}

export default function MyRentalsPage() {
  return <MyRentalsPageContent />;
}