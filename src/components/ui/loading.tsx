import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <svg
      className={cn(
        'animate-spin text-primary',
        sizes[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface LoadingOverlayProps {
  children?: ReactNode;
  className?: string;
}

export function LoadingOverlay({ children, className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50',
      className
    )}>
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex items-center space-x-3 space-x-reverse">
          <LoadingSpinner size="lg" />
          <div className="text-lg font-medium text-gray-900">
            {children || 'טוען...'}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingCard({ title, description, className }: LoadingCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
      className
    )}>
      <div className="flex items-center justify-center space-x-3 space-x-reverse">
        <LoadingSpinner size="lg" />
        <div>
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ title, description }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          {title || 'טוען...'}
        </h2>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingButton({ loading, children, size = 'md', className }: LoadingButtonProps) {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm';
  
  return (
    <span className={cn('inline-flex items-center', className)}>
      {loading && (
        <LoadingSpinner size={spinnerSize} className="ml-2" />
      )}
      {children}
    </span>
  );
}

// Skeleton loading components
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'animate-pulse bg-gray-200 rounded',
      className
    )} />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={3} />
        <div className="flex space-x-4 space-x-reverse">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}