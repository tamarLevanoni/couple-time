'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useUserStore, useUserProfile } from '@/store';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading, updateProfile } = useUserStore();
  const userProfile = useUserProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || ''
      });
    }
  }, [status, userProfile, router]);

  if (status === 'loading' || isLoading) {
    return <LoadingPage title="טוען פרטי משתמש..." />;
  }

  if (!session) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            הפרטים שלי
          </h1>
          <p className="text-lg text-gray-600">
            נהלו את פרטי החשבון שלכם
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  פרטים אישיים
                </h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    ערוך פרטים
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם מלא
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="הכניסו את השם המלא שלכם"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 p-3 rounded">
                      {userProfile?.name || 'לא הוגדר'}
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

                {isEditing && (
                  <div className="flex items-center space-x-4 space-x-reverse pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                    >
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
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                פעולות מהירות
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <span>ההשאלות שלי</span>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span>עיין במשחקים</span>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span>מצא מוקדים</span>
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                מידע נוסף
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <span className="font-medium">תאריך הצטרפות:</span>
                  <div>
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('he-IL') : 'לא זמין'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">עדכון אחרון:</span>
                  <div>
                    {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString('he-IL') : 'לא זמין'}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}