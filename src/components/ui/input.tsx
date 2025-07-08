import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, startIcon, endIcon, fullWidth = false, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{startIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm transition-colors',
              'focus:border-primary focus:ring-primary focus:ring-1',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              className
            )}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{endIcon}</span>
            </div>
          )}
        </div>
        
        {(error || helper) && (
          <p className={cn(
            'text-sm',
            hasError ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';