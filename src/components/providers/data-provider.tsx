'use client';

import { ReactNode } from 'react';
import { useDataInit } from '@/hooks/use-data-init';
import { useUserInit } from '@/hooks/use-user-init';

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Initialize public data once at the app level
  useDataInit();
  
  // Initialize user data when authenticated
  useUserInit();
  
  return <>{children}</>;
}