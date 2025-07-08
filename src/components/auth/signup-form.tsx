'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { CreateUserSchema, type CreateUser } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';

interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className = '' }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateUser & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: CreateUser & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate data (excluding confirmPassword)
      const { confirmPassword, ...userData } = data;
      const validatedData = CreateUserSchema.parse(userData);
      
      logger.debug('Signup attempt', { email: validatedData.email });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'שגיאה ברישום');
        logger.authFailure('registration', validatedData.email, result.error);
      } else {
        setSuccess(true);
        logger.authSuccess('registration', result.user?.id || 'unknown');
        setTimeout(() => {
          router.push('/auth/signin?message=account_created');
        }, 2000);
      }
    } catch (err) {
      logger.error('Signup form error', { error: err instanceof Error ? err.message : 'Unknown error' });
      setError('שגיאה ברישום. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              החשבון נוצר בהצלחה!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              אתה מועבר עכשיו לדף ההתחברות...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl-he font-semibold text-center mb-6 text-gray-900">
          יצירת חשבון חדש
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              שם מלא *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'שם מלא נדרש' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="הכנס שם מלא"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              כתובת דוא"ל *
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              מספר טלפון
            </label>
            <input
              id="phone"
              type="tel"
              dir="ltr"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0501234567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה *
            </label>
            <input
              id="password"
              type="password"
              {...register('password', { 
                required: 'סיסמה נדרשת',
                minLength: { value: 6, message: 'סיסמה חייבת להכיל לפחות 6 תווים' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="הכנס סיסמה"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              אישור סיסמה *
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { 
                required: 'אישור סיסמה נדרש',
                validate: value => value === password || 'הסיסמאות אינן תואמות'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="הכנס סיסמה שוב"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
          >
            צור חשבון
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            יש לך כבר חשבון?{' '}
            <a
              href="/auth/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              התחבר כאן
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}