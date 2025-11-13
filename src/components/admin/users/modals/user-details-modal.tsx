'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserForAdmin } from '@/types/computed';
import { formatUserName, formatDate } from '@/lib/utils';
import { getRoleLabel } from '@/lib/labels';
import { AlertCircle } from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserForAdmin | null;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsModalProps) {
  if (!user) return null;

  const hasCoordinatorRole = user.roles.includes('CENTER_COORDINATOR');
  const hasSuperRole = user.roles.includes('SUPER_COORDINATOR');

  // Check for warnings
  const warnings: string[] = [];
  if (hasCoordinatorRole && !user.managedCenter) {
    warnings.push('רכז מוקד ללא מוקד משוייך');
  }
  if (hasSuperRole && user.supervisedCenters.length === 0) {
    warnings.push('רכז על ללא מוקדים מפוקחים');
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>פרטי משתמש</DialogTitle>
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
            {/* Left Column */}
            <div className="space-y-4">
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-semibold mb-3">מידע אישי</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">שם מלא</p>
                    <p className="font-medium">
                      {formatUserName(user.firstName, user.lastName)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">אימייל</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">טלפון</p>
                    <p className="font-medium">{user.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">תאריך הצטרפות</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">סטטוס</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div>
                <h3 className="text-base font-semibold mb-3">תפקידים</h3>
                {user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {getRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">משתמש רגיל</p>
                )}
              </div>
            </div>

            {/* Right Column - Center Assignments */}
            <div className="space-y-4">
              {(hasCoordinatorRole || hasSuperRole) && (
                <>
                  <h3 className="text-base font-semibold">שיוכי מוקדים</h3>

                  {hasCoordinatorRole && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">מוקד מנוהל</p>
                      {user.managedCenter ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{user.managedCenter.name}</p>
                          <p className="text-sm text-gray-600">
                            {user.managedCenter.area}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">אין מוקד משוייך</p>
                      )}
                    </div>
                  )}

                  {hasSuperRole && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">מוקדים מפוקחים</p>
                      {user.supervisedCenters.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {user.supervisedCenters.map((center) => (
                            <div
                              key={center.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <p className="font-medium">{center.name}</p>
                              <p className="text-sm text-gray-600">{center.area}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">אין מוקדים מפוקחים</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {!hasCoordinatorRole && !hasSuperRole && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">אין שיוכי מוקדים</p>
                </div>
              )}
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
