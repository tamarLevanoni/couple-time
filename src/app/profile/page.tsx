'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingPage } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  User, 
  Shield, 
  Calendar, 
  GameController, 
  MapPin, 
  Settings, 
  CheckCircle, 
  AlertCircle 
} from '@/components/icons';
import { 
  useUserStore, 
  useUserProfile, 
  useUserRoles, 
  useHasPrivilegedRole, 
  useUserManagedCenter, 
  useRentalsStore,
  useFilteredUserRentals,
  useRentalCounts,
  useCentersStore,
  useGamesStore,
  useGameById,
  useCenterById
} from '@/store';

// Component to display rental item with proper hook usage
function RentalItem({ rental }: { rental: any }) {
  const gameId = rental.gameInstances?.[0]?.gameId;
  const game = useGameById(gameId);
  const center = useCenterById(rental.centerId);
  
  return (
    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
      <div>
        <p className="text-sm font-medium text-green-800">
          {rental.gameInstances?.[0]?.game?.name || game?.name || 'משחק לא ידוע'}
        </p>
        <p className="text-xs text-green-600">
          {rental.center?.name || center?.name || 'מוקד לא ידוע'}
        </p>
      </div>
      <div className="text-xs text-green-600">
        {rental.expectedReturnDate && 
          `החזרה: ${new Date(rental.expectedReturnDate).toLocaleDateString('he-IL')}`
        }
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLoading, updateProfile, error } = useUserStore();
  const { loadUserRentals } = useRentalsStore();
  
  // User data hooks
  const userProfile = useUserProfile();
  const userRoles = useUserRoles();
  const hasPrivilegedRole = useHasPrivilegedRole();
  const managedCenterId = useUserManagedCenter();
  const managedCenter = useCenterById(managedCenterId || undefined);
  
  // Use proper rental data from rentals store instead of user store
  const allUserRentals = useFilteredUserRentals();
  const activeRentals = allUserRentals.filter(rental => rental.status === 'ACTIVE');
  const rentalCounts = useRentalCounts();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  
  // Load data for statistics
  useEffect(() => {
    if (session) {
      loadUserRentals();
    }
  }, [session, loadUserRentals]);

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
    setSaveError('');
    setIsSaving(true);
    
    // Basic validation
    if (!formData.name.trim()) {
      setSaveError('שם הוא שדה חובה');
      setIsSaving(false);
      return;
    }
    
    if (!formData.phone.trim()) {
      setSaveError('מספר טלפון הוא שדה חובה');
      setIsSaving(false);
      return;
    }
    
    try {
      await updateProfile(formData);
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
      name: userProfile?.name || '',
      phone: userProfile?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            הפרטים שלי
          </h1>
          <p className="text-lg text-gray-600">
            נהלו את פרטי החשבון שלכם
          </p>
        </div>

        {/* User Role Badge */}
        {hasPrivilegedRole && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 ml-2" />
              <span className="text-blue-800 font-medium">
                {userRoles.includes('ADMIN') && 'מנהל מערכת'}
                {userRoles.includes('SUPER_COORDINATOR') && !userRoles.includes('ADMIN') && 'רכז-על'}
                {userRoles.includes('CENTER_COORDINATOR') && !userRoles.includes('SUPER_COORDINATOR') && !userRoles.includes('ADMIN') && 'רכז מוקד'}
                {managedCenter && ` • ${managedCenter.name}`}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
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

                {/* Error Display */}
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
            
            {/* Rental Statistics */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <GameController className="h-5 w-5 text-gray-600 ml-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  נתוני השאלות
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{rentalCounts.pending}</div>
                  <div className="text-sm text-blue-800">ממתינות</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{rentalCounts.active}</div>
                  <div className="text-sm text-green-800">פעילות</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{rentalCounts.returned}</div>
                  <div className="text-sm text-gray-800">הוחזרו</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{rentalCounts.total}</div>
                  <div className="text-sm text-gray-800">סה&quot;כ</div>
                </div>
              </div>
              
              {activeRentals.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">השאלות פעילות:</h3>
                  <div className="space-y-2">
                    {activeRentals.slice(0, 3).map((rental) => {
                      return (
                        <RentalItem key={rental.id} rental={rental} />
                      );
                    })}
                    {activeRentals.length > 3 && (
                      <Link href="/my-rentals">
                        <Button variant="ghost" size="sm" className="w-full">
                          ראה עוד {activeRentals.length - 3} השאלות
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                פעולות מהירות
              </h3>
              <div className="space-y-3">
                <Link href="/my-rentals">
                  <Button variant="outline" className="w-full justify-start">
                    <GameController className="h-4 w-4 ml-2" />
                    <span>ההשאלות שלי</span>
                    {rentalCounts.active > 0 && (
                      <span className="mr-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {rentalCounts.active}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/games">
                  <Button variant="outline" className="w-full justify-start">
                    <GameController className="h-4 w-4 ml-2" />
                    <span>עיין במשחקים</span>
                  </Button>
                </Link>
                <Link href="/centers">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 ml-2" />
                    <span>מצא מוקדים</span>
                  </Button>
                </Link>
                <Link href="/rent">
                  <Button className="w-full justify-start">
                    <GameController className="h-4 w-4 ml-2" />
                    <span>השאל משחק חדש</span>
                  </Button>
                </Link>
                
                {hasPrivilegedRole && (
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700">
                      <Shield className="h-4 w-4 ml-2" />
                      <span>לוח בקרה</span>
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

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
                        {managedCenter.name} • {managedCenter.city}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    
  );
}