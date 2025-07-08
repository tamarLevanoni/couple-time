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

interface GamesListProps {
  games: Game[];
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

export function GamesList({ games }: GamesListProps) {
  return (
    <div className="space-y-4">
      {games.map((game) => {
        const availabilityColor = game.availableCount > 0 ? 'text-green-600' : 'text-red-600';
        const availabilityText = game.availableCount > 0 ? 'זמין' : 'לא זמין';
        
        return (
          <div key={game.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {game.imageUrl ? (
                  <Image
                    src={game.imageUrl}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                    <Heart className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {game.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {game.description}
                    </p>
                  </div>
                  
                  {/* Availability Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-50 ${availabilityColor} whitespace-nowrap`}>
                    {availabilityText}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>{categoryLabels[game.category as keyof typeof categoryLabels] || game.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{audienceLabels[game.targetAudience as keyof typeof audienceLabels] || game.targetAudience}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{game.availableCenters} מוקדים</span>
                  </div>
                </div>

                {/* Availability Info and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="text-gray-600">זמינות: </span>
                      <span className={`font-medium ${availabilityColor}`}>
                        {game.availableCount} מתוך {game.totalInstances}
                      </span>
                    </div>
                    
                    {game.availableCount > 0 && (
                      <div className="bg-green-50 rounded-full h-2 w-16 overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${(game.availableCount / game.totalInstances) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/games/${game.id}`}>
                      <Button variant="outline" size="sm">
                        פרטים
                      </Button>
                    </Link>
                    
                    {game.availableCount > 0 && (
                      <Link href={`/games/${game.id}?action=rent`}>
                        <Button size="sm">
                          השאל עכשיו
                        </Button>
                      </Link>
                    )}
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