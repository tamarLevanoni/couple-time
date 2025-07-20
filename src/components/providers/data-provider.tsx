'use client';

import { ReactNode } from 'react';
import { useDataInit } from '@/hooks/use-data-init';
import { useUserData } from '@/hooks/use-user-data';

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Initialize public data once at the app level
  useDataInit();
  
  // Initialize user data (SWR will handle the authentication check)
  useUserData();
  
  return <>{children}</>;
}