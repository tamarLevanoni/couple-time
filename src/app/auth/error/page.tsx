'use client';

import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ErrorCard } from '@/components/ui/error';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { useEffect } from 'react';

const errorMessages: Record<string, { title: string; message: string }> = {
  Configuration: {
    title: 'שגיאת תצורה',
    message: 'יש בעיה בהגדרות המערכת. אנא פנה למנהל המערכת.',
  },
  AccessDenied: {
    title: 'גישה נדחתה',
    message: 'אין לך הרשאה לגשת למשאב זה.',
  },
  Verification: {
    title: 'שגיאת אימות',
    message: 'לא ניתן לאמת את זהותך. אנא נסה שוב.',
  },
  Default: {
    title: 'שגיאת התחברות',
    message: 'אירעה שגיאה במהלך ההתחברות. אנא נסה שוב או פנה לתמיכה.',
  },
  DatabaseConnection: {
    title: 'שגיאת חיבור',
    message: 'לא ניתן להתחבר למסד הנתונים כרגע. אנא נסה שוב מאוחר יותר.',
  },
  Credentials: {
    title: 'פרטי התחברות שגויים',
    message: 'כתובת הדוא"ל או הסיסמה שהוזנו אינם נכונים.',
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      // Log auth error for monitoring (but don't expose sensitive details)
      logger.authFailure('auth_error_page', undefined, `Auth error: ${error}`);
    }
  }, [error]);

  // Determine error type from the error parameter
  let errorType = 'Default';
  
  if (error) {
    if (error.includes('Database') || error.includes('database')) {
      errorType = 'DatabaseConnection';
    } else if (error.includes('Configuration')) {
      errorType = 'Configuration';
    } else if (error.includes('AccessDenied')) {
      errorType = 'AccessDenied';
    } else if (error.includes('Verification')) {
      errorType = 'Verification';
    } else if (error.includes('Credentials') || error.includes('credentials')) {
      errorType = 'Credentials';
    }
  }

  const errorInfo = errorMessages[errorType] || errorMessages.Default;

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <ErrorCard
            title={errorInfo.title}
            message={errorInfo.message}
            action={{
              label: 'חזור להתחברות',
              onClick: () => window.location.href = '/auth/signin',
            }}
          />
          
          <div className="mt-6 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/auth/signin">נסה שוב</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">חזור לדף הבית</Link>
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer">פרטים טכניים (פיתוח)</summary>
                <code className="block mt-2 p-2 bg-gray-100 rounded text-left" dir="ltr">
                  {error}
                </code>
              </details>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}