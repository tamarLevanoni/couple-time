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
    email: string;
  };
  superCoordinator: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
  stats: {
    totalGames: number;
    activeRentals: number;
  };
}

interface CenterCardProps {
  center: Center;
}

const areaLabels = {
  JERUSALEM: 'ירושלים',
  CENTER: 'מרכז',
  NORTH: 'צפון',
  SOUTH: 'דרום',
  JUDEA_SAMARIA: 'יהודה ושומרון'
};

export function CenterCard({ center }: CenterCardProps) {
  const whatsappUrl = `https://wa.me/972${center?.coordinator?.phone.replace(/[^0-9]/g, '').substring(1)}?text=${encodeURIComponent('שלום, אני מעוניין/ת במידע על השאלת משחקי זוגיות')}`;
  const phoneUrl = `tel:${center?.coordinator?.phone}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 bg-gradient-to-l from-primary/5 to-primary/10 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {center.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{center.city}</span>
              <span className="text-gray-400">•</span>
              <span>{areaLabels[center.area as keyof typeof areaLabels] || center.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Coordinator Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">רכז:</span>
            <span>{center.coordinator?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{center.coordinator?.phone}</span>
          </div>
        </div>

        {/* Super Coordinator Info */}
        {center.superCoordinator && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <User className="h-4 w-4" />
              <span className="font-medium">רכז-על:</span>
              <span>{center.superCoordinator?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{center.superCoordinator?.phone}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <GameController className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">משחקים</span>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {center.stats.totalGames}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">פעילות</span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {center.stats.activeRentals}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
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
  );
}