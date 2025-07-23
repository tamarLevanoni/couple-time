'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons';
import { useAuthStore } from '@/store/auth-store';
import { handleGoogleOAuth } from '@/lib/google-oauth';
import { RegisterWithEmailInput } from '@/lib/validations';

export function SignupForm() {
  const [formData, setFormData] = useState<RegisterWithEmailInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { closeAuthPopup, setAuthPopupMode } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'שגיאה ברישום');
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('רישום הצליח אך ההתחברות נכשלה');
      } else {
        closeAuthPopup();
        // Stay on current page - no redirect
      }
    } catch (err) {
      setError('שגיאה ברישום');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      // Google OAuth will redirect, but session manager will close modal when user returns
      await handleGoogleOAuth();
    } catch (error) {
      setError('שגיאה בהתחברות עם Google');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">הרשמה</h2>
        <p className="mt-2 text-gray-600">
          צרו חשבון חדש כדי להתחיל להשאיל משחקים
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              שם פרטי
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="שם פרטי"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              שם משפחה
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="שם משפחה"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            אימייל
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="הכניסו את האימייל שלכם"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            טלפון
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="הכניסו את מספר הטלפון שלכם"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="בחרו סיסמה חזקה"
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
          disabled={isLoading}
        >
          {isLoading ? 'נרשם...' : 'הירשם'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">או</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        className="w-full"
      >
        <GoogleIcon className="w-5 h-5 ml-2" />
        הירשם עם Google
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          יש לכם כבר חשבון?{' '}
          <button 
            onClick={() => setAuthPopupMode('login')}
            className="text-blue-600 hover:underline"
          >
            התחברו כאן
          </button>
        </p>
      </div>
    </Card>
  );
}