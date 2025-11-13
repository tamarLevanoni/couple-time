'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CenterForAdmin } from '@/types';
import { formatUserName, formatDate } from '@/lib/utils';
import { getAreaLabel } from '@/lib/labels';
import { AlertCircle } from 'lucide-react';

interface CenterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: CenterForAdmin | null;
}

export function CenterDetailsModal({
  isOpen,
  onClose,
  center,
}: CenterDetailsModalProps) {
  if (!center) return null;

  // Parse location from JsonValue
  const locationData = center.location as { lat: number; lng: number } | null;

  // Check for warnings
  const warnings: string[] = [];
  if (center.isActive && !center.coordinator) {
    warnings.push('מוקד פעיל ללא רכז');
  }
  if (center.isActive && !center.superCoordinator) {
    warnings.push('מוקד פעיל ללא רכז על - מומלץ למנות רכז על');
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>פרטי מוקד</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Main Content Grid - Side by Side Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Center Info */}
            <div className="space-y-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-base font-semibold mb-3">מידע בסיסי</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">שם המוקד</p>
                    <p className="font-medium">{center.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">אזור</p>
                    <p className="font-medium">{getAreaLabel(center.area)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">סטטוס</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        center.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {center.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">מיקום</p>
                    <p className="font-medium">
                      {locationData
                        ? `קו רוחב: ${locationData.lat}, קו אורך: ${locationData.lng}`
                        : 'לא הוגדר'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">תאריך יצירה</p>
                    <p className="font-medium">{formatDate(center.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-base font-semibold mb-3">סטטיסטיקה</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">סה״כ משחקים</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {center._count.gameInstances}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Coordinators */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">רכזים</h3>

              {/* Coordinator */}
              <div>
                <p className="text-xs text-gray-500 mb-2">רכז מוקד</p>
                {center.coordinator ? (
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <p className="font-medium">
                      {formatUserName(
                        center.coordinator.firstName,
                        center.coordinator.lastName
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{center.coordinator.email}</p>
                    <p className="text-sm text-gray-600">{center.coordinator.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">לא משוייך</p>
                )}
              </div>

              {/* Super Coordinator */}
              <div>
                <p className="text-xs text-gray-500 mb-2">רכז על</p>
                {center.superCoordinator ? (
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <p className="font-medium">
                      {formatUserName(
                        center.superCoordinator.firstName,
                        center.superCoordinator.lastName
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {center.superCoordinator.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {center.superCoordinator.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">לא משוייך</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button onClick={onClose}>סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
