'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, User, GameController, Calendar } from '@/components/icons';

interface Center {
  id: string;
  name: string;
  city: string;
  area: string;
  location: any;
  coordinator: {
    id: string;
    name: string;
    phone: string;
  } | null;
  superCoordinator: {
    id: string;
    name: string;
    phone: string;
  } | null;
  stats: {
    totalGames: number;
    activeRentals: number;
  };
}

interface CentersListProps {
  centers: Center[];
}

const areaLabels = {
  JERUSALEM: 'ירושלים',
  CENTER: 'מרכז',
  NORTH: 'צפון',
  SOUTH: 'דרום',
  JUDEA_SAMARIA: 'יהודה ושומרון'
};

export function CentersList({ centers }: CentersListProps) {
  return (
    <div className="space-y-4">
      {centers.map((center) => {
        const whatsappUrl = `https://wa.me/972${center.coordinator?.phone.replace(/[^0-9]/g, '').substring(1)}?text=${encodeURIComponent('שלום, אני מעוניין/ת במידע על השאלת משחקי זוגיות')}`;
        const phoneUrl = `tel:${center.coordinator?.phone}`;

        return (
          <div key={center.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {center.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{center.city}</span>
                    <span className="text-gray-400">•</span>
                    <span>{areaLabels[center.area as keyof typeof areaLabels] || center.area}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-4 w-4" />
                      <span className="font-medium">רכז:</span>
                      <span>{center.coordinator?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{center.coordinator?.phone}</span>
                    </div>
                  </div>

                  {center.superCoordinator && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="h-4 w-4" />
                        <span className="font-medium">רכז-על:</span>
                        <span>{center.superCoordinator.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{center.superCoordinator.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="lg:w-80">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <GameController className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">משחקים</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {center.stats.totalGames}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">פעילות</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      {center.stats.activeRentals}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Link href={`/centers/${center.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        פרטי מוקד
                      </Button>
                    </Link>
                    
                    <Link href={`/centers/${center.id}/games`} className="flex-1">
                      <Button size="sm" className="w-full">
                        צפה במשחקים
                      </Button>
                    </Link>
                  </div>

                  {/* Contact Options */}
                  <div className="flex gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                        WhatsApp
                      </Button>
                    </a>
                    
                    <a href={phoneUrl} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        התקשר
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}