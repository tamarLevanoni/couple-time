'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useRentalsStore,
  useFilteredUserRentals,
  useRentalCounts
} from '@/store';
import { RentalStatus } from '@/types';
import { getRentalStatusLabel } from '@/lib/rental-utils';
import { CancelRentalDialog } from './cancel-rental-dialog';
import { RentalAlerts } from './rental-alerts';
import { RentalTabs } from './rental-tabs';
import { RentalEmptyState } from './rental-empty-state';
import { RentalCard } from './rental-card';

export function MyRentalsContent() {

  const router = useRouter();
  const searchParams = useSearchParams();

  // Subscribe only to error from store (primitive value)
  const error = useRentalsStore((state) => state.error);

  const filteredRentals = useFilteredUserRentals();
  const rentalCounts = useRentalCounts();

  // Local state
  const [selectedStatus, setSelectedStatus] = useState<RentalStatus>('ACTIVE');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [rentalToCancel, setRentalToCancel] = useState<string | null>(null);
  const { cancelRental, filterByStatus } = useRentalsStore();

  // Check for success message from URL params for new requests
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'rental-created') {
      setSuccessMessage('הבקשה נשלחה בהצלחה! תקבלו עדכון מהרכז בהקדם האפשרי');
      setShowSuccessMessage(true);

      // Clear URL params without reload
      router.replace('/profile#my-rentals', { scroll: false });

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams, router]);

  // Show store errors
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  // Handle status filter change
  useEffect(() => {
    filterByStatus(selectedStatus);
  }, [selectedStatus]);

  // Show cancellation confirmation dialog
  const handleCancelClick = (rentalId: string) => {
    setRentalToCancel(rentalId);
    setShowCancelDialog(true);
  };

  // Confirm and execute cancellation
  const confirmCancel = async () => {
    if (!rentalToCancel) return;

    try {
      setErrorMessage(null);
      setShowCancelDialog(false);
      setCancelingId(rentalToCancel);

      await cancelRental(rentalToCancel);

      // Show success message
      setSuccessMessage('הבקשה בוטלה בהצלחה');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);

      // Store already updates optimistically, no need to reload
    } catch (error) {
      const message = error instanceof Error ? error.message : 'שגיאה בביטול הבקשה. אנא נסו שוב.';
      setErrorMessage(message);
      console.error('Failed to cancel rental:', error);
    } finally {
      setCancelingId(null);
      setRentalToCancel(null);
    }
  };

  // Cancel the cancellation dialog
  const cancelDialog = () => {
    setShowCancelDialog(false);
    setRentalToCancel(null);
  };

  // Get empty state message
  const getEmptyStateMessage = (): string => {
    return `אין בקשות בסטטוס "${getRentalStatusLabel(selectedStatus)}"`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cancel Confirmation Dialog */}
      <CancelRentalDialog
        isOpen={showCancelDialog}
        onConfirm={confirmCancel}
        onCancel={cancelDialog}
      />

      {/* Tabs */}
      <RentalTabs
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        counts={rentalCounts}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success and Error Messages */}
        <RentalAlerts
          successMessage={showSuccessMessage ? successMessage : null}
          errorMessage={errorMessage}
          onDismissSuccess={() => setShowSuccessMessage(false)}
          onDismissError={() => setErrorMessage(null)}
        />

        {/* Rentals List */}
        {filteredRentals.length === 0 ? (
          <RentalEmptyState message={getEmptyStateMessage()} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRentals.map(rental => (
              <RentalCard
                key={rental.id}
                rental={rental}
                isCanceling={cancelingId === rental.id}
                onCancel={handleCancelClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
