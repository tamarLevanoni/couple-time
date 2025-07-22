'use client';

import { useEffect, useState, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

export function MyRentalsContent() {
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

  // Check for success message from URL params
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'rental-created') {
      setShowSuccessMessage(true);
      // Clear URL params
      const newUrl = window.location.pathname;
      router.replace(newUrl);
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, router]);

  // Load rentals when component mounts and session is available
  useEffect(() => {
    if (session?.user) {
      loadUserRentals();
    }
  }, [session, loadUserRentals]);

  // Handle status filter change
  useEffect(() => {
    filterByStatus(selectedStatus);
  }, [selectedStatus, filterByStatus]);

  // Status labels
  const getStatusLabel = (status: RentalStatus): string => {
    const labels: Record<RentalStatus, string> = {
      PENDING: 'ממתין לאישור',
      ACTIVE: 'פעיל',
      RETURNED: 'הוחזר',
      CANCELLED: 'בוטל'
    };
    return labels[status];
  };

  // Status colors
  const getStatusColor = (status: RentalStatus): string => {
    const colors: Record<RentalStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      RETURNED: 'bg-blue-100 text-blue-800 border-blue-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status];
  };

  // Handle rental cancellation
  const handleCancel = async (rentalId: string) => {
    if (!confirm('האם אתם בטוחים שברצונכם לבטל את הבקשה?')) {
      return;
    }

    try {
      setCancelingId(rentalId);
      await cancelRental(rentalId);
      // Refresh the list
      loadUserRentals();
    } catch (error) {
      console.error('Failed to cancel rental:', error);
    } finally {
      setCancelingId(null);
    }
  };

  // Format date
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
            <div>
              <p className="font-medium text-green-900">הבקשה נשלחה בהצלחה!</p>
              <p className="text-sm text-green-700">
                תקבלו עדכון מהרכז בהקדם האפשרי
              </p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="mr-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <label className="text-sm font-medium text-gray-700">
              סינון לפי סטטוס:
            </label>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as RentalStatus | 'ALL')}
              options={[
                { value: 'ALL', label: `כל הבקשות (${rentalCounts.total})` },
                { value: 'PENDING', label: `ממתין (${rentalCounts.pending})` },
                { value: 'ACTIVE', label: `פעיל (${rentalCounts.active})` },
                { value: 'RETURNED', label: `הוחזר (${rentalCounts.returned})` },
                { value: 'CANCELLED', label: `בוטל (${rentalCounts.cancelled})` }
              ]}
            />
          </div>
          
          <Button
            onClick={() => router.push('/rent')}
            size="sm"
          >
            + הזמנה חדשה
          </Button>
        </div>
      </Card>

      {/* Rentals List */}
      {filteredRentals.length === 0 ? (
        <Card className="p-8 text-center">
          <GameController className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-500 mb-2">
            {selectedStatus === 'ALL' ? 'אין לכם בקשות השאלה' : `אין בקשות בסטטוס "${getStatusLabel(selectedStatus as RentalStatus)}"`}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            בחרו משחק מהקטלוג ושלחו בקשת השאלה
          </p>
          <Button onClick={() => router.push('/games')}>
            עיינו במשחקים
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map(rental => (
            <RentalCard
              key={rental.id}
              rental={rental}
              isCanceling={cancelingId === rental.id}
              onCancel={handleCancel}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Memoized rental card component for better performance
const RentalCard = memo(({ 
  rental, 
  isCanceling, 
  onCancel, 
  getStatusLabel, 
  getStatusColor, 
  formatDate 
}: {
  rental: RentalForUser;
  isCanceling: boolean;
  onCancel: (id: string) => Promise<void>;
  getStatusLabel: (status: RentalStatus) => string;
  getStatusColor: (status: RentalStatus) => string;
  formatDate: (date: string | Date) => string;
}) => {
  const canCancel = useCanCancelRental(rental.id);
  
  return (
  <Card className="p-6">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      {/* Left side - Rental info */}
      <div className="flex-1 space-y-4">
        {/* Status and dates */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(rental.status)}`}>
            {getStatusLabel(rental.status)}
          </span>
          <span className="text-sm text-gray-500">
            בקשה נשלחה: {formatDate(rental.createdAt)}
          </span>
          {rental.borrowDate && (
            <span className="text-sm text-gray-500">
              הושאל: {formatDate(rental.borrowDate)}
            </span>
          )}
          {rental.returnDate && (
            <span className="text-sm text-gray-500">
              הוחזר: {formatDate(rental.returnDate)}
            </span>
          )}
        </div>

        {/* Games */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            משחקים ({rental.gameInstances?.length || 0})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rental.gameInstances?.map(gameInstance => (
              <div key={gameInstance.id} className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                <GameController className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {gameInstance.game?.name || 'משחק לא ידוע'}
                  </p>
                  <p className="text-xs text-gray-500">
                    סטטוס: {gameInstance.status === 'AVAILABLE' ? 'זמין' : gameInstance.status === 'BORROWED' ? 'מושאל' : 'לא זמין'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center info */}
        {rental.center && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">פרטי המוקד</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{rental.center.name}</p>
              <p>{rental.center.city}</p>
              {rental.center.coordinator && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Phone className="h-4 w-4" />
                  <span>
                    רכז: {rental.center.coordinator.name}
                    {rental.center.coordinator.phone && 
                      ` - ${rental.center.coordinator.phone}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {rental.notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">הערות</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{rental.notes}</p>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex lg:flex-col gap-2">
        {canCancel && (
          <Button
            onClick={() => onCancel(rental.id)}
            disabled={isCanceling}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            {isCanceling ? 'מבטל...' : 'בטל בקשה'}
          </Button>
        )}
        {rental.status === 'ACTIVE' && rental.center?.coordinator?.phone && (
          <a
            href={`tel:${rental.center.coordinator.phone}`}
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-md hover:bg-green-50"
          >
            התקשר לרכז
          </a>
        )}
      </div>
    </div>
  </Card>
  );
});

RentalCard.displayName = 'RentalCard';