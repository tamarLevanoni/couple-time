'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User, Settings, CheckCircle, AlertCircle } from '@/components/icons';

interface UserProfileCardProps {
  userProfile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  onUpdateProfile: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  error?: string | null;
}

export function UserProfileCard({ userProfile, onUpdateProfile, error }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);
    
    if (!formData.firstName.trim()) {
      setSaveError('שם פרטי הוא שדה חובה');
      setIsSaving(false);
      return;
    }
    
    if (!formData.lastName.trim()) {
      setSaveError('שם משפחה הוא שדה חובה');
      setIsSaving(false);
      return;
    }
    
    if (!formData.phone.trim()) {
      setSaveError('מספר טלפון הוא שדה חובה');
      setIsSaving(false);
      return;
    }
    
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('שגיאה בשמירת הפרטים. אנא נסו שוב.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      phone: userProfile?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <User className="h-5 w-5 text-gray-600 ml-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            פרטים אישיים
          </h2>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-4 w-4 ml-1" />
            ערוך פרטים
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם פרטי
          </label>
          {isEditing ? (
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="הכניסו את השם הפרטי שלכם"
            />
          ) : (
            <div className="text-gray-900 bg-gray-50 p-3 rounded">
              {userProfile?.firstName || 'לא הוגדר'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם משפחה
          </label>
          {isEditing ? (
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="הכניסו את שם המשפחה שלכם"
            />
          ) : (
            <div className="text-gray-900 bg-gray-50 p-3 rounded">
              {userProfile?.lastName || 'לא הוגדר'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אימייל
          </label>
          <div className="text-gray-900 bg-gray-50 p-3 rounded">
            {userProfile?.email}
            <span className="text-sm text-gray-500 mr-2">(לא ניתן לשינוי)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            טלפון
          </label>
          {isEditing ? (
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="הכניסו את מספר הטלפון שלכם"
            />
          ) : (
            <div className="text-gray-900 bg-gray-50 p-3 rounded">
              {userProfile?.phone || 'לא הוגדר'}
            </div>
          )}
        </div>

        {(saveError || error) && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
            <p className="text-sm text-red-700">
              {saveError || error}
            </p>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center space-x-4 space-x-reverse pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <CheckCircle className="h-4 w-4 ml-1" />
              {isSaving ? 'שומר...' : 'שמור שינויים'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              ביטול
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}