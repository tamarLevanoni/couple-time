'use client';

import { ReactNode } from 'react';


interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className = '' }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
    </div>
  );
}