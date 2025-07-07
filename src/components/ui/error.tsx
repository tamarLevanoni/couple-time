import { Button } from './button';
import { hebrewLabels } from '@/constants/design-system';
import { cn } from '@/utils/cn';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorMessage = ({
  title = 'שגיאה',
  message = hebrewLabels.messages.error,
  onRetry,
  retryText = 'נסה שוב',
  className,
}: ErrorMessageProps) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4 p-6 bg-destructive/5 border border-destructive/20 rounded-lg',
      className
    )}>
      {/* Error Icon */}
      <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full">
        <svg
          className="w-6 h-6 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Error Content */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-destructive font-hebrew">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-hebrew-body max-w-md">
          {message}
        </p>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryText}
        </Button>
      )}
    </div>
  );
};

interface ErrorPageProps {
  title?: string;
  message?: string;
  onGoHome?: () => void;
  onRetry?: () => void;
  homeText?: string;
  retryText?: string;
  className?: string;
}

export const ErrorPage = ({
  title = 'משהו השתבש',
  message = 'אירעה שגיאה לא צפויה. אנא נסה שוב או חזור לעמוד הבית.',
  onGoHome,
  onRetry,
  homeText = 'חזור לעמוד הבית',
  retryText = 'נסה שוב',
  className,
}: ErrorPageProps) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center',
      className
    )}>
      {/* Large Error Icon */}
      <div className="flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full">
        <svg
          className="w-10 h-10 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Error Content */}
      <div className="space-y-4 max-w-md">
        <h1 className="text-3xl font-bold text-destructive font-hebrew">
          {title}
        </h1>
        <p className="text-muted-foreground font-hebrew-body">
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 space-x-reverse">
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            {homeText}
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry}>
            {retryText}
          </Button>
        )}
      </div>
    </div>
  );
};

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundaryFallback = ({ error, resetError }: ErrorBoundaryFallbackProps) => {
  return (
    <ErrorPage
      title="שגיאה במערכת"
      message={`אירעה שגיאה לא צפויה במערכת. אנא נסה לרענן את הדף.${
        process.env.NODE_ENV === 'development' ? ` שגיאה: ${error.message}` : ''
      }`}
      onRetry={resetError}
      retryText="רענן דף"
    />
  );
};

// Empty state component
interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  title = 'אין נתונים',
  message = hebrewLabels.messages.noData,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) => {
  const defaultIcon = (
    <svg
      className="w-10 h-10 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4 p-8 text-center',
      className
    )}>
      <div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full">
        {icon || defaultIcon}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-muted-foreground font-hebrew">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-hebrew-body max-w-md">
          {message}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};