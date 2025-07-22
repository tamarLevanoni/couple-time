'use client';

import { useEffect, useState, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { ErrorPage } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Phone, 
  X, 
  AlertCircle,
  GameController 
} from '@/components/icons';
import { 
  useRentalsStore, 
  useFilteredUserRentals,
  useRentalCounts,
  useCanCancelRental
} from '@/store';
import { RentalStatus, RentalForUser } from '@/types';

export default function MyRentalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // Store hooks
  const { 
    loadUserRentals, 
    cancelRental, 
    filterByStatus,
    isLoading, 
    isSubmitting, 
    error 
  } = useRentalsStore();
  
  const filteredRentals = useFilteredUserRentals();
  const rentalCounts = useRentalCounts();
  
  // Local state
  const [selectedStatus, setSelectedStatus] = useState<RentalStatus | 'ALL'>('ALL');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  
  // Check for success message from URL
  useEffect(() => {
    if (searchParams.get('success') === 'rental-created') {
      setShowSuccessMessage(true);
      // Clean up URL
      router.replace('/my-rentals', { scroll: false });
    }
  }, [searchParams, router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Load rentals on mount
  useEffect(() => {
    if (session) {
      loadUserRentals();
    }
  }, [session]); // Remove loadUserRentals from deps
  
  // Handle status filter change
  useEffect(() => {
    filterByStatus(selectedStatus);
  }, [selectedStatus]); // Remove filterByStatus from deps
  
  // Handle rental cancellation
  const handleCancelRental = async (rentalId: string) => {
    if (!confirm('האם אתם בטוחים שברצונכם לבטל את בקשת ההשאלה?')) {
      return;
    }
    
    setCancelingId(rentalId);
    try {
      await cancelRental(rentalId);
    } catch (error) {
      console.error('Failed to cancel rental:', error);
    } finally {
      setCancelingId(null);
    }
  };
  
  // Loading state - only show loading spinner if we have no data at all
  if (status === 'loading' || (status === 'authenticated' && isLoading && filteredRentals.length === 0)) {
    return <LoadingPage title="טוען השאלות..." />;
  }
  
  // Not authenticated
  if (status === 'unauthenticated') {
    return null; // Will redirect
  }
  
  // Error state
  if (error) {
    return (
      <MainLayout>
        <ErrorPage 
          message={error} 
          action={{
            label: 'נסה שוב',
            onClick: loadUserRentals
          }}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ההשאלות שלי
          </h1>
          <p className="text-lg text-gray-600">
            עקבו אחר בקשות ההשאלה והמשחקים הפעילים שלכם
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-8 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
            <div className="flex-1">
              <p className="text-sm text-green-700 font-medium">
                בקשת ההשאלה נשלחה בהצלחה!
              </p>
              <p className="text-sm text-green-600">
                הרכז יצור איתכם קשר בקרוב לתיאום איסוף המשחק
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuccessMessage(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filters & Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סטטוס השאלה
              </label>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as RentalStatus | 'ALL')}
                options={[
                  { value: 'ALL', label: `הכל (${rentalCounts.total})` },
                  { value: 'PENDING', label: `ממתינות לאישור (${rentalCounts.pending})` },
                  { value: 'ACTIVE', label: `פעילות (${rentalCounts.active})` },
                  { value: 'RETURNED', label: `הוחזרו (${rentalCounts.returned})` },
                  { value: 'CANCELLED', label: `בוטלו (${rentalCounts.cancelled})` }
                ]}
              />
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-4 space-x-reverse text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{rentalCounts.pending}</div>
                <div className="text-gray-600">ממתינות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{rentalCounts.active}</div>
                <div className="text-gray-600">פעילות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{rentalCounts.returned}</div>
                <div className="text-gray-600">הוחזרו</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rentals List */}
        {filteredRentals.length === 0 ? (
          <Card className="p-12 text-center">
            <GameController className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedStatus === 'ALL' ? 'אין השאלות' : 'אין השאלות בסטטוס הנבחר'}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'ALL' 
                ? 'עדיין לא ביקשתם להשאיל משחקים' 
                : 'שנו את הסינון כדי לראות השאלות אחרות'}
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button 
                onClick={() => router.push('/games')}
              >
                עיינו במשחקים
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/rent')}
              >
                השאילו משחק
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredRentals.map((rental) => (
              <RentalCard
                key={rental.id}
                rental={rental}
                onCancel={handleCancelRental}
                isCanceling={cancelingId === rental.id}
              />
            ))}
          </div>
        )}

        {/* Load More / Pagination Placeholder */}
        {filteredRentals.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              מציג {filteredRentals.length} השאלות
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Rental Card Component - Memoized to prevent unnecessary re-renders
const RentalCard = memo(function RentalCard({ 
  rental, 
  onCancel, 
  isCanceling 
}: { 
  rental: RentalForUser;
  onCancel: (id: string) => void;
  isCanceling: boolean;
}) {
  // const canCancel = useCanCancelRental(rental.id);
  const canCancel = rental?.status === 'PENDING';
  
  const getStatusInfo = (status: RentalStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'ממתינה לאישור',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: Clock
        };
      case 'ACTIVE':
        return {
          label: 'פעילה',
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: CheckCircle
        };
      case 'RETURNED':
        return {
          label: 'הוחזרה',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: CheckCircle
        };
      case 'CANCELLED':
        return {
          label: 'בוטלה',
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: X
        };
      default:
        return {
          label: status,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: AlertCircle
        };
    }
  };
  
  const statusInfo = getStatusInfo(rental.status);
  const StatusIcon = statusInfo.icon;
  
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {rental.gameInstances?.[0]?.game?.name || 'משחק לא ידוע'}
          </h3>
          <p className="text-sm text-gray-600">
            מוקד: {rental.center?.name} • {rental.center?.city}
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full border ${statusInfo.color} flex items-center`}>
          <StatusIcon className="h-4 w-4 ml-1" />
          <span className="text-sm font-medium">{statusInfo.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {rental.requestDate&&(<div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 ml-2" />
          <span>נבקש: {new Date(rental.requestDate).toLocaleDateString('he-IL')}</span>
        </div>)}
        
        {rental.borrowDate && (
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 ml-2" />
            <span>אושר: {new Date(rental.borrowDate).toLocaleDateString('he-IL')}</span>
          </div>
        )}
        
        {rental.expectedReturnDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 ml-2" />
            <span>החזרה צפויה: {new Date(rental.expectedReturnDate).toLocaleDateString('he-IL')}</span>
          </div>
        )}
      </div>

      {rental.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>הערות:</strong> {rental.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2 space-x-reverse">
          {rental.center?.coordinator?.phone && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${rental.center?.coordinator?.phone}`)}
              >
                <Phone className="h-4 w-4 ml-1" />
                התקשר לרכז
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const message = encodeURIComponent(`שלום! בקשר להשאלת המשחק "${rental.gameInstances?.[0]?.game?.name}" מהמוקד ${rental.center?.name}`);
                  window.open(`https://wa.me/972${rental.center?.coordinator?.phone?.replace(/^0/, '')}?text=${message}`);
                }}
              >
                שלח וואצאפ
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(rental.id)}
              disabled={isCanceling}
            >
              {isCanceling ? 'מבטל...' : 'בטל בקשה'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});