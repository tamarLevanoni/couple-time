'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { getCategoryLabel, getAudienceLabel } from '@/lib/labels';
import { GameWithInstances } from '@/types/models';
import { GameInstanceStatus } from '@/types/schema';

interface GameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameWithInstances | null;
}

export function GameDetailsModal({ isOpen, onClose, game }: GameDetailsModalProps) {
  if (!game) return null;

  // Calculate statistics from game instances
  const totalInstances = game.gameInstances?.length || 0;
  const availableInstances = game.gameInstances?.filter(
    (instance) => instance.status === GameInstanceStatus.AVAILABLE
  ).length || 0;
  const borrowedInstances = game.gameInstances?.filter(
    (instance) => instance.status === GameInstanceStatus.BORROWED
  ).length || 0;
  const unavailableInstances = game.gameInstances?.filter(
    (instance) => instance.status === GameInstanceStatus.UNAVAILABLE
  ).length || 0;

  // Generate warnings
  const warnings: string[] = [];
  if (totalInstances === 0) {
    warnings.push('אין עותקים של משחק זה במערכת');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">פרטי משחק</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{warning}</p>
                </div>
              ))}
            </div>
          )}

          {/* Primary Image */}
          {game.primaryImageUrl && (
            <div className="flex justify-center">
              <img
                src={game.primaryImageUrl}
                alt={game.name}
                className="w-64 h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Gallery Images */}
          {game.galleryImageUrls && game.galleryImageUrls.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">גלריית תמונות</h3>
              <div className="flex flex-wrap gap-2">
                {game.galleryImageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${game.name} - תמונה ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">מידע בסיסי</h3>

              <div>
                <label className="text-sm font-medium text-gray-500">שם המשחק</label>
                <p className="mt-1 text-base">{game.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">תיאור</label>
                <p className="mt-1 text-base text-gray-700">
                  {game.description || 'לא הוגדר תיאור'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">קטגוריות</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {game.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {getCategoryLabel(category)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">קהל יעד</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {game.targetAudiences.map((audience) => (
                    <Badge key={audience} variant="outline">
                      {getAudienceLabel(audience)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">תאריך יצירה</label>
                <p className="mt-1 text-base">
                  {new Date(game.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">סטטיסטיקה</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">סה"כ עותקים</span>
                  <span className="text-lg font-bold">{totalInstances}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium text-green-700">עותקים זמינים</span>
                  <span className="text-lg font-bold text-green-700">{availableInstances}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-sm font-medium text-blue-700">מושאלים</span>
                  <span className="text-lg font-bold text-blue-700">{borrowedInstances}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-sm font-medium text-red-700">לא זמינים</span>
                  <span className="text-lg font-bold text-red-700">{unavailableInstances}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            סגור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
