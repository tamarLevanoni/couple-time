'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameController } from '@/components/icons';

interface RentalCounts {
  pending: number;
  active: number;
  returned: number;
  total: number;
}

interface ActiveRental {
  id: string;
  expectedReturnDate?: Date | null;
  gameInstances?: Array<{
    game?: { name: string } | null;
  }> | null;
  center?: { name: string } | null;
}

interface RentalStatisticsProps {
  rentalCounts: RentalCounts;
  activeRentals: ActiveRental[];
  centerId?: string;
  gameId?: string;
}

function RentalItem({ rental, centerId, gameId }: { 
  rental: ActiveRental; 
  centerId?: string; 
  gameId?: string; 
}) {
  // Use hooks from parent context if needed
  const gameName = rental.gameInstances?.[0]?.game?.name || 'משחק לא ידוע';
  const centerName = rental.center?.name || 'מוקד לא ידוע';
  
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
      <div>
        <p className="text-sm font-medium text-green-800">
          {gameName}
        </p>
        <p className="text-xs text-green-600">
          {centerName}
        </p>
      </div>
      <div className="text-xs text-green-600">
        {rental.expectedReturnDate && 
          `החזרה: ${new Date(rental.expectedReturnDate).toLocaleDateString('he-IL')}`
        }
      </div>
    </div>
  );
}

export function RentalStatistics({ rentalCounts, activeRentals, centerId, gameId }: RentalStatisticsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <GameController className="h-5 w-5 text-gray-600 ml-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          נתוני השאלות
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{rentalCounts.pending}</div>
          <div className="text-sm text-blue-800">ממתינות</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{rentalCounts.active}</div>
          <div className="text-sm text-green-800">פעילות</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{rentalCounts.returned}</div>
          <div className="text-sm text-gray-800">הוחזרו</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{rentalCounts.total}</div>
          <div className="text-sm text-gray-800">סה&quot;כ</div>
        </div>
      </div>
      
      {activeRentals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">השאלות פעילות:</h3>
          <div className="space-y-2">
            {activeRentals.slice(0, 3).map((rental) => (
              <RentalItem 
                key={rental.id} 
                rental={rental} 
                centerId={centerId} 
                gameId={gameId} 
              />
            ))}
            {activeRentals.length > 3 && (
              <Link href="/my-rentals">
                <Button variant="ghost" size="sm" className="w-full">
                  ראה עוד {activeRentals.length - 3} השאלות
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}