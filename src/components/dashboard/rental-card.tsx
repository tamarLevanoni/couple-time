'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUserName } from '@/lib/utils';
import type { RentalForCoordinator, RentalStatus } from '@/types';

interface RentalCardProps {
  rental: RentalForCoordinator;
  onApprove?: (rentalId: string) => void;
  onMarkReturned?: (rentalId: string) => void;
  onViewDetails?: (rentalId: string) => void;
  isSubmitting?: boolean;
  formatDate: (date: string | Date | null) => string;
  showActions?: boolean;
}

export function RentalCard({ 
  rental, 
  onApprove, 
  onMarkReturned, 
  onViewDetails,
  isSubmitting = false,
  formatDate,
  showActions = true
}: RentalCardProps) {
  const getStatusBadgeVariant = (status: RentalStatus) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'ACTIVE': return 'default';
      case 'RETURNED': return 'outline';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const isOverdue = (rental: any) => {
    return rental.status === 'ACTIVE' && 
           rental.expectedReturnDate && 
           new Date(rental.expectedReturnDate) < new Date();
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{formatUserName(rental.user?.firstName, rental.user?.lastName)}</span>
          <Badge variant={getStatusBadgeVariant(rental.status)}>
            {rental.status}
          </Badge>
          {isOverdue(rental) && (
            <Badge variant="destructive">Overdue</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          {rental.gameInstances?.map(gi => gi.game?.name).join(', ') || 'No games'}
        </p>
        
        {rental.status === 'PENDING' && (
          <>
            <p className="text-xs text-muted-foreground">
              Requested: {formatDate(rental.createdAt)}
            </p>
            {rental.expectedReturnDate && (
              <p className="text-xs text-muted-foreground">
                Expected Return: {formatDate(rental.expectedReturnDate)}
              </p>
            )}
          </>
        )}
        
        {rental.status === 'ACTIVE' && (
          <>
            <p className="text-xs text-muted-foreground">
              Borrowed: {rental.borrowDate ? formatDate(rental.borrowDate) : 'N/A'}
            </p>
            {rental.expectedReturnDate && (
              <p className={`text-xs ${isOverdue(rental) ? 'text-destructive' : 'text-muted-foreground'}`}>
                Expected Return: {formatDate(rental.expectedReturnDate)}
              </p>
            )}
          </>
        )}
        
        {(rental.status === 'RETURNED' || rental.status === 'CANCELLED') && (
          <p className="text-xs text-muted-foreground">
            {rental.status === 'RETURNED' 
              ? `Returned: ${rental.returnDate ? formatDate(rental.returnDate) : 'N/A'}`
              : `Cancelled: ${formatDate(rental.createdAt)}`
            }
          </p>
        )}
      </div>
      
      {showActions && (
        <div className="flex gap-2">
          {rental.status === 'PENDING' && onApprove && (
            <Button
              size="sm"
              onClick={() => onApprove(rental.id)}
              disabled={isSubmitting}
            >
              Approve
            </Button>
          )}
          {rental.status === 'ACTIVE' && onMarkReturned && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkReturned(rental.id)}
              disabled={isSubmitting}
            >
              Mark Returned
            </Button>
          )}
          {onViewDetails && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(rental.id)}
              disabled={isSubmitting}
            >
              View Details
            </Button>
          )}
        </div>
      )}
    </div>
  );
}