import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, X } from '@/components/icons';

interface RentalAlertsProps {
  successMessage: string | null;
  errorMessage: string | null;
  onDismissSuccess: () => void;
  onDismissError: () => void;
}

export function RentalAlerts({
  successMessage,
  errorMessage,
  onDismissSuccess,
  onDismissError
}: RentalAlertsProps) {
  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
            <div className="flex-1">
              <p className="font-medium text-green-900">{successMessage}</p>
            </div>
            <button
              onClick={onDismissSuccess}
              className="mr-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
            <div>
              <p className="font-medium text-red-900">שגיאה</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <button
              onClick={onDismissError}
              className="mr-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}
    </>
  );
}
