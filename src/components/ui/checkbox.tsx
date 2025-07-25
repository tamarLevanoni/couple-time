import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
  helper?: string;
  size?: number | undefined;
}

const sizes: Record<number, string> = {
  12: 'h-3 w-3',
  16: 'h-4 w-4', 
  20: 'h-5 w-5',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helper, size = 16, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'rounded border-gray-300 text-primary shadow-sm transition-colors',
              'focus:border-primary focus:ring-primary focus:ring-1',
              'disabled:cursor-not-allowed disabled:bg-gray-50',
              hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              sizes[size] || `h-[${size}px] w-[${size}px]`,
              className
            )}
            {...props}
          />
          
          {label && (
            <label htmlFor={props.id} className="mr-2 text-sm text-gray-700 cursor-pointer">
              {label}
            </label>
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

Checkbox.displayName = 'Checkbox';