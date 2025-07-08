'use client';

import { ReactNode } from 'react';
import { useDataInit } from '@/hooks/use-data-init';

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  // Initialize data once at the app level
  useDataInit();
  
  return <>{children}</>;
}