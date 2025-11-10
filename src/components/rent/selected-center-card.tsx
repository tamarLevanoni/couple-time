import { Card } from '@/components/ui/card';
import { MapPin } from '@/components/icons';
import { CenterPublicInfo } from '@/types';

interface SelectedCenterCardProps {
  selectedCenter: CenterPublicInfo | undefined;
  isAuthenticated: boolean;
}

/**
 * SelectedCenterCard - Displays information about the selected center in the rental form
 * Shows center name, coordinator details, and phone (if authenticated)
 * @param selectedCenter - The selected center object or undefined if none selected
 * @param isAuthenticated - Whether the user is logged in (affects phone visibility)
 */
export function SelectedCenterCard({ selectedCenter, isAuthenticated }: SelectedCenterCardProps) {
  if (!selectedCenter) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center mb-3">
        <MapPin className="h-5 w-5 text-primary ml-2" />
        <h3 className="font-semibold text-gray-900">מוקד נבחר</h3>
      </div>
      <div className="space-y-2 text-sm">
        <p className="font-medium">{selectedCenter.name}</p>
        {selectedCenter.coordinator && (
          <p className="text-gray-600">
            רכז: {selectedCenter.coordinator.firstName}
          </p>
        )}
        {selectedCenter.coordinator?.phone && (
          <p className="text-gray-600">
            טלפון: {isAuthenticated
              ? selectedCenter.coordinator.phone
              : 'אנא התחבר כדי לראות את מספר הטלפון'}
          </p>
        )}
      </div>
    </Card>
  );
}
