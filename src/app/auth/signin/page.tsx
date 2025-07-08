import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { MainLayout } from '@/components/layout/main-layout';
import { LoadingCard } from '@/components/ui/loading';

export default function SignInPage() {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingCard title="טוען טופס התחברות..." />}>
          <LoginForm />
        </Suspense>
      </div>
    </MainLayout>
  );
}