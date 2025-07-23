'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RentalCard } from './rental-card';
import type { RentalForCoordinator, RentalStatus } from '@/types';

interface RentalListProps {
  title: string;
  rentals: Array<RentalForCoordinator>;
  onApprove?: (rentalId: string) => void;
  onMarkReturned?: (rentalId: string) => void;
  onViewDetails?: (rentalId: string) => void;
  isSubmitting?: boolean;
  formatDate: (date: string | Date | null) => string;
  emptyMessage?: string;
  limit?: number;
  showActions?: boolean;
}

export function RentalList({ 
  title,
  rentals,
  onApprove,
  onMarkReturned,
  onViewDetails,
  isSubmitting = false,
  formatDate,
  emptyMessage = "No rentals found",
  limit,
  showActions = true
}: RentalListProps) {
  const displayRentals = limit ? rentals.slice(0, limit) : rentals;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rentals.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {displayRentals.map((rental) => (
              <RentalCard
                key={rental.id}
                rental={rental}
                onApprove={onApprove}
                onMarkReturned={onMarkReturned}
                onViewDetails={onViewDetails}
                isSubmitting={isSubmitting}
                formatDate={formatDate}
                showActions={showActions}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}