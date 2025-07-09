'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { LoginSchema, type Login } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/icons';

interface LoginFormProps {
  callbackUrl?: string;
  className?: string;
}

export function LoginForm({ callbackUrl = '/', className = '' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>();

  const onSubmit = async (data: Login) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate data
      const validatedData = LoginSchema.parse(data);
      
      logger.debug('Login attempt', { email: validatedData.email });

      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('אימייל או סיסמה שגויים');
        logger.authFailure('credentials_login', validatedData.email, result.error);
      } else if (result?.ok) {
        // Get updated session and redirect
        const session = await getSession();
        logger.authSuccess('credentials_login', session?.user?.id || 'unknown');
        router.replace(callbackUrl);
      }
    } catch (err) {
      logger.error('Login form error', { error: err instanceof Error ? err.message : 'Unknown error' });
      setError('שגיאה בהתחברות. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Google login attempt');
      await signIn('google', { callbackUrl });
    } catch (err) {
      logger.error('Google login error', { error: err instanceof Error ? err.message : 'Unknown error' });
      setError('שגיאה בהתחברות עם Google. אנא נסה שוב.');
      setIsLoading(false);
    }
  };

  // Check if Google OAuth is available (credentials are configured)
  const isGoogleOAuthAvailable = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== undefined;

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl-he font-semibold text-center mb-6 text-gray-900">
          התחברות למערכת
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              כתובת דוא&quot;ל
            </label>
            <input
              id="email"
              type="email"
              dir="ltr"
              {...register('email', { required: 'כתובת דוא"ל נדרשת' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { required: 'סיסמה נדרשת' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="הכנס סיסמה"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            התחבר
          </Button>
        </form>

        {/* Google OAuth section - only show if credentials are configured */}
        {isGoogleOAuthAvailable && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">או</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              fullWidth
              className="mt-4"
            >
              <GoogleIcon className="w-4 h-4 ml-2" />
              התחבר עם Google
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            אין לך חשבון?{' '}
            <a
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              הירשם כאן
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}