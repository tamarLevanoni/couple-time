import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, GameController, MapPin, User, Calendar } from '@/components/icons';
import { useCanCancelRental } from '@/store';
import { RentalForUser } from '@/types';
import { formatUserName } from '@/lib/utils';
import {
  getRentalStatusLabel,
  getRentalStatusColor,
  formatDateHebrew
} from '@/lib/rental-utils';
import { cn } from '@/lib/utils';

interface RentalCardProps {
  rental: RentalForUser;
  isCanceling: boolean;
  onCancel: (id: string) => void;
}

export const RentalCard = memo(({
  rental,
  isCanceling,
  onCancel
}: RentalCardProps) => {
  const canCancel = useCanCancelRental(rental.id);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with status */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
          getRentalStatusColor(rental.status)
        )}>
          {getRentalStatusLabel(rental.status)}
        </span>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5 ml-1" />
          <span>נשלח {formatDateHebrew(rental.createdAt)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Games Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GameController className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              {rental.gameInstances?.length || 0} משחקים
            </h3>
          </div>
          <div className="space-y-2">
            {rental.gameInstances?.map((gameInstance) => (
              <div
                key={gameInstance.id}
                className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="h-8 w-8 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <GameController className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {gameInstance.game?.name || 'משחק לא ידוע'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {gameInstance.status === 'AVAILABLE' ? 'זמין' :
                      gameInstance.status === 'BORROWED' ? 'מושאל' : 'לא זמין'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Info */}
        {rental.center && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{rental.center.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rental.center.city}</p>
                {rental.center.coordinator && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                    <User className="h-3.5 w-3.5" />
                    <span>
                      {formatUserName(
                        rental.center.coordinator.firstName,
                        rental.center.coordinator.lastName
                      )}
                    </span>
                    {rental.center.coordinator.phone && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{rental.center.coordinator.phone}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline - show only if relevant */}
        {(rental.borrowDate || rental.returnDate) && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
              {rental.borrowDate && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>הושאל: {formatDateHebrew(rental.borrowDate)}</span>
                </div>
              )}
              {rental.returnDate && (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>הוחזר: {formatDateHebrew(rental.returnDate)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {rental.notes && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
              <span className="font-medium text-gray-700">הערות: </span>
              {rental.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {(canCancel || (rental.status === 'ACTIVE' && rental.center?.coordinator?.phone)) && (
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            {canCancel && (
              <Button
                onClick={() => onCancel(rental.id)}
                disabled={isCanceling}
                variant="outline"
                size="sm"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                {isCanceling ? 'מבטל...' : 'בטל בקשה'}
              </Button>
            )}
            {rental.status === 'ACTIVE' && rental.center?.coordinator?.phone && (
              <a
                href={`tel:${rental.center.coordinator.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-200 rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>התקשר לרכז</span>
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

RentalCard.displayName = 'RentalCard';
