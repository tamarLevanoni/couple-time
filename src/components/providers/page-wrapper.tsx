'use client';

import { ReactNode, Suspense } from 'react';
import { LoadingPage } from '@/components/ui/loading';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
}

export function PageWrapper({ children, title = "טוען..." }: PageWrapperProps) {
  return (
    <Suspense fallback={<LoadingPage title={title} />}>
      {children}
    </Suspense>
  );
}