'use client';

import { Card } from '@/components/ui/card';
import { Calendar, Shield, MapPin } from '@/components/icons';

interface UserInfoProps {
  userProfile: {
    createdAt?: Date;
  } | null;
  userRoles: string[];
  managedCenter?: {
    name: string;
  } | null;
}

export function UserInfo({ userProfile, userRoles, managedCenter }: UserInfoProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        מידע נוסף
      </h3>
      <div className="text-sm text-gray-600 space-y-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 ml-2" />
          <div>
            <span className="font-medium">הצטרפתי:</span>
            <div className="text-xs">
              {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('he-IL') : 'לא זמין'}
            </div>
          </div>
        </div>
        
        {userRoles.length > 0 && (
          <div className="flex items-center">
            <Shield className="h-4 w-4 ml-2" />
            <div>
              <span className="font-medium">תפקידים:</span>
              <div className="text-xs space-y-1">
                {userRoles.includes('ADMIN') && <div className="text-purple-600">מנהל מערכת</div>}
                {userRoles.includes('SUPER_COORDINATOR') && <div className="text-blue-600">רכז-על</div>}
                {userRoles.includes('CENTER_COORDINATOR') && <div className="text-green-600">רכז מוקד</div>}
                <div className="text-gray-600">משתמש</div>
              </div>
            </div>
          </div>
        )}
        
        {managedCenter && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 ml-2" />
            <div>
              <span className="font-medium">מוקד:</span>
              <div className="text-xs">
                {managedCenter.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}