'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GoogleIcon } from '@/components/icons';
import { useAuthStore } from '@/store/auth-store';
import { handleGoogleOAuth } from '@/lib/google-oauth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { closeAuthPopup, setAuthPopupMode } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('פרטי התחברות שגויים');
      } else {
        closeAuthPopup();
        // Stay on current page - no redirect
      }
    } catch (err) {
      setError('שגיאה בהתחברות');
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

  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">התחברות</h2>
        <p className="mt-2 text-gray-600">
          התחברו לחשבון שלכם כדי להמשיך
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            אימייל
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="הכניסו את האימייל שלכם"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="הכניסו את הסיסמה שלכם"
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
          {isLoading ? 'מתחבר...' : 'התחבר'}
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
        התחבר עם Google
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          אין לכם חשבון?{' '}
          <button 
            onClick={() => setAuthPopupMode('signup')}
            className="text-blue-600 hover:underline"
          >
            הירשמו כאן
          </button>
        </p>
      </div>
    </Card>
  );
}