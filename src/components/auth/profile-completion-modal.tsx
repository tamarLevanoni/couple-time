'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store';
import { useSession } from 'next-auth/react';


interface ProfileCompletionModalProps {
  email: string;
  googleId: string;
}

export function ProfileCompletionModal({ email, googleId }: ProfileCompletionModalProps) {
  const [name, setName] = useState('');
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
      await completeProfile({ name, phone });
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              שם מלא *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="הכניסו את השם המלא שלכם"
              minLength={2}
            />
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
            disabled={isLoading || !name.trim() || !phone.trim()}
          >
            {isLoading ? 'משלים פרטים...' : 'המשיכו'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            על ידי המשך השימוש אתם מסכימים לתנאי השימוש שלנו
          </p>
        </div>
      </Card>
  );
}