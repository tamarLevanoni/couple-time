'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Heart } from '@/components/icons';

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  imageUrl: string;
  availableCount: number;
  totalInstances: number;
  availableCenters: number;
}

interface GameCardProps {
  game: Game;
}

const categoryLabels = {
  COMMUNICATION: 'תקשורת',
  INTIMACY: 'אינטימיות',
  FUN: 'כיף',
  THERAPY: 'טיפול',
  PERSONAL_DEVELOPMENT: 'התפתחות אישית'
};

const audienceLabels = {
  SINGLES: 'רווקים',
  MARRIED: 'נשואים',
  GENERAL: 'כללי'
};

export function GameCard({ game }: GameCardProps) {
  const availabilityColor = game.availableCount > 0 ? 'text-green-600' : 'text-red-600';
  const availabilityText = game.availableCount > 0 ? 'זמין' : 'לא זמין';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {game.imageUrl ? (
          <Image
            src={game.imageUrl}
            alt={game.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
            <Heart className="h-12 w-12 text-primary/40" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${availabilityColor}`}>
            {availabilityText}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
            {game.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {game.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>{categoryLabels[game.category as keyof typeof categoryLabels] || game.category}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{audienceLabels[game.targetAudience as keyof typeof audienceLabels] || game.targetAudience}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{game.availableCenters} מוקדים</span>
          </div>
        </div>

        {/* Availability Info */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">זמינות:</span>
            <span className={`font-medium ${availabilityColor}`}>
              {game.availableCount} מתוך {game.totalInstances}
            </span>
          </div>
          
          {game.availableCount > 0 && (
            <div className="mt-1 bg-green-50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(game.availableCount / game.totalInstances) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/games/${game.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              פרטים
            </Button>
          </Link>
          
          {game.availableCount > 0 && (
            <Link href={`/games/${game.id}?action=rent`} className="flex-1">
              <Button size="sm" className="w-full">
                השאל עכשיו
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}