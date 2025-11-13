import { AlertCircle } from 'lucide-react';

interface WarningDisplayProps {
  warnings: string[];
  className?: string;
}

export function WarningDisplay({ warnings, className = '' }: WarningDisplayProps) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <div className={`p-3 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="space-y-2">
        {warnings.map((warning, index) => (
          <div key={index} className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{warning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
