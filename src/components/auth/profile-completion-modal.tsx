'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store';
import { useSession, signOut } from 'next-auth/react';


interface ProfileCompletionModalProps {
  email: string;
  googleId: string;
}

export function ProfileCompletionModal({ email, googleId }: ProfileCompletionModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await completeProfile({ firstName, lastName, phone });
      await update(); // מרענן את ה־session עם ה־JWT החדש

      console.log('✅ Profile completion successful, reloading session');

      // Stay on current page - just reload to update session
      window.location.reload();
    } catch (err) {
      setError('שגיאה בהתחברות לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      window.location.reload();
    } catch (err) {
      setError('שגיאה בהתנתקות');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">השלמת פרטים</h2>
          <p className="mt-2 text-gray-600">
            כדי להמשיך, אנא השלימו את הפרטים הבאים
          </p>
          <p className="mt-1 text-sm text-gray-500">
            אימייל: {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                שם פרטי *
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="שם פרטי"
                minLength={2}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                שם משפחה *
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="שם משפחה"
                minLength={2}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              מספר טלפון *
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="050-1234567"
              pattern="^0[2-9]\d-?\d{7}$"
              title="מספר טלפון ישראלי תקין (לדוגמה: 050-1234567)"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !firstName.trim() || !lastName.trim() || !phone.trim()}
          >
            {isLoading ? 'משלים פרטים...' : 'המשיכו'}
          </Button>
        </form>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleContinueAsGuest}
          disabled={isLoading}
        >
          המשך כאורח
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            על ידי המשך השימוש אתם מסכימים לתנאי השימוש שלנו
          </p>
        </div>
      </Card>
  );
}