'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User, Settings, CheckCircle, AlertCircle } from '@/components/icons';
import { UpdateUserProfileSchema, type UpdateUserProfileInput } from '@/lib/validations';

interface UserProfileCardProps {
  userProfile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  onUpdateProfile: (data: UpdateUserProfileInput) => Promise<void>;
  error?: string | null;
}

export function UserProfileCard({ userProfile, onUpdateProfile, error }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileInput>({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    setFieldErrors({});
    setIsSaving(true);

    try {
      // Validate using Zod schema
      const validatedData = UpdateUserProfileSchema.parse(formData);

      await onUpdateProfile(validatedData);
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        // Map Zod errors to field-specific errors
        const zodError = error as any;
        const errors: Record<string, string> = {};

        zodError.errors?.forEach((err: any) => {
          const field = err.path[0];
          errors[field] = err.message;
        });

        setFieldErrors(errors);
      } else {
        // General error
        setFieldErrors({ general: error instanceof Error ? error.message : 'שגיאה בשמירת הפרטים. אנא נסו שוב.' });
      }
      console.error('Error updating profile:', error);
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
    setFieldErrors({});
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
            <>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="הכניסו את השם הפרטי שלכם"
              />
              {fieldErrors.firstName && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>
              )}
            </>
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
            <>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="הכניסו את שם המשפחה שלכם"
              />
              {fieldErrors.lastName && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>
              )}
            </>
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
            <>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="הכניסו את מספר הטלפון שלכם"
              />
              {fieldErrors.phone && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>
              )}
            </>
          ) : (
            <div className="text-gray-900 bg-gray-50 p-3 rounded">
              {userProfile?.phone || 'לא הוגדר'}
            </div>
          )}
        </div>

        {(fieldErrors.general || error) && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
            <p className="text-sm text-red-700">
              {fieldErrors.general || error}
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