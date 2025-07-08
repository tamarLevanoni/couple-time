import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, fullWidth = false, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm transition-colors',
            'focus:border-primary focus:ring-primary focus:ring-1',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            hasError && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        
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

Textarea.displayName = 'Textarea';