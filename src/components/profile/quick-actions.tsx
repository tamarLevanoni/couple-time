'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameController, MapPin, Shield } from '@/components/icons';

interface QuickActionsProps {
  activeRentalCount: number;
  hasPrivilegedRole: boolean;
}

export function QuickActions({ activeRentalCount, hasPrivilegedRole }: QuickActionsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        פעולות מהירות
      </h3>
      <div className="space-y-3">
        <a href="#my-rentals">
          <Button variant="outline" className="w-full justify-start">
            <GameController className="h-4 w-4 ml-2" />
            <span>ההשאלות שלי</span>
            {activeRentalCount > 0 && (
              <span className="mr-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {activeRentalCount}
              </span>
            )}
          </Button>
        </a>
        <Link href="/games">
          <Button variant="outline" className="w-full justify-start">
            <GameController className="h-4 w-4 ml-2" />
            <span>עיין במשחקים</span>
          </Button>
        </Link>
        <Link href="/centers">
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="h-4 w-4 ml-2" />
            <span>מצא מוקדים</span>
          </Button>
        </Link>
        <Link href="/rent">
          <Button className="w-full justify-start">
            <GameController className="h-4 w-4 ml-2" />
            <span>השאל משחק חדש</span>
          </Button>
        </Link>
        
        {hasPrivilegedRole && (
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700">
              <Shield className="h-4 w-4 ml-2" />
              <span>לוח בקרה</span>
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}