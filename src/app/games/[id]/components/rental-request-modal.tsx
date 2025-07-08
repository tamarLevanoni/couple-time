'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorAlert } from '@/components/ui/error';
import { X, MapPin, Phone, User } from '@/components/icons';
import { GameDetails } from '@/store/games-store';

interface RentalRequestModalProps {
  game: GameDetails;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  centerId: string;
  gameInstanceId: string;
  notes: string;
  // Guest user fields
  name: string;
  phone: string;
  email: string;
}

export function RentalRequestModal({ game, isOpen, onClose }: RentalRequestModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    centerId: '',
    gameInstanceId: '',
    notes: '',
    name: session?.user?.name || '',
    phone: session?.user?.phone || '',
    email: session?.user?.email || ''
  });

  const availableCenters = game.centerAvailability.filter(ca => ca.available > 0);
  const selectedCenter = availableCenters.find(ca => ca.center.id === formData.centerId);
  const availableInstances = selectedCenter?.instances.filter(i => i.status === 'AVAILABLE') || [];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleCenterChange = (centerId: string) => {
    const center = availableCenters.find(ca => ca.center.id === centerId);
    const firstAvailableInstance = center?.instances.find(i => i.status === 'AVAILABLE');
    
    setFormData(prev => ({
      ...prev,
      centerId,
      gameInstanceId: firstAvailableInstance?.id || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.centerId || !formData.gameInstanceId) {
      setError('יש לבחור מוקד ומשחק');
      return;
    }

    if (!session && (!formData.name || !formData.phone || !formData.email)) {
      setError('יש למלא את כל השדות הנדרשים');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = session ? '/api/rentals' : '/api/rentals/guest';
      const requestData = session ? {
        gameInstanceId: formData.gameInstanceId,
        centerId: formData.centerId,
        notes: formData.notes
      } : {
        gameInstanceId: formData.gameInstanceId,
        centerId: formData.centerId,
        notes: formData.notes,
        userData: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'שגיאה בשליחת הבקשה');
      }

      setSuccess(true);
      
      // Redirect after a moment
      setTimeout(() => {
        if (session) {
          router.push('/dashboard/my-rentals');
        } else {
          router.push('/auth/signin?message=rental-created');
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשליחת הבקשה');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            בקשת השאלה - {game.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                הבקשה נשלחה בהצלחה!
              </h3>
              <p className="text-gray-600 mb-4">
                הרכז יקבל התראה ויצור איתכם קשר בהקדם
              </p>
              <p className="text-sm text-gray-500">
                מעביר אותך לעמוד ההשאלות שלך...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <ErrorAlert message={error} />
              )}

              {/* Center Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  בחר מוקד *
                </label>
                <Select
                  value={formData.centerId}
                  onChange={handleCenterChange}
                  options={[
                    { value: '', label: 'בחר מוקד' },
                    ...availableCenters.map(ca => ({
                      value: ca.center.id,
                      label: `${ca.center.name} - ${ca.center.city} (${ca.available} זמין)`
                    }))
                  ]}
                  required
                />
                
                {selectedCenter && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedCenter.center.city}, {selectedCenter.center.area}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>רכז: {selectedCenter.center.coordinator.name}</span>
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{selectedCenter.center.coordinator.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Instance Selection */}
              {selectedCenter && availableInstances.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    בחר עותק זמין
                  </label>
                  <Select
                    value={formData.gameInstanceId}
                    onChange={(value) => handleInputChange('gameInstanceId', value)}
                    options={[
                      { value: '', label: 'בחר עותק' },
                      ...availableInstances.map((instance, index) => ({
                        value: instance.id,
                        label: `עותק ${index + 1}`
                      }))
                    ]}
                    required
                  />
                </div>
              )}

              {/* Guest User Information */}
              {!session && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">
                    פרטים אישיים (נדרש להרשמה)
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם מלא *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="הכנס את שמך המלא"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      טלפון *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="050-1234567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      אימייל *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הערות (אופציונלי)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="הערות נוספות לרכז..."
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.centerId || !formData.gameInstanceId}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="ml-2" />
                      שולח...
                    </>
                  ) : (
                    'שלח בקשה'
                  )}
                </Button>
              </div>

              {!session && (
                <p className="text-xs text-gray-500 text-center">
                  לאחר שליחת הבקשה ייווצר עבורך חשבון חדש במערכת
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}