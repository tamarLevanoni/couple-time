import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/icons';
import { RENTAL_PROCESS_STEPS } from '@/lib/rental-constants';

/**
 * ProcessInfoCard - Displays step-by-step instructions for the rental process
 */
export function ProcessInfoCard() {
  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="flex items-center mb-3">
        <Calendar className="h-5 w-5 text-blue-600 ml-2" />
        <h3 className="font-semibold text-blue-900">איך זה עובד?</h3>
      </div>
      <div className="space-y-2 text-sm text-blue-800" role="list" aria-label="תהליך השאלת משחק">
        {RENTAL_PROCESS_STEPS.map((step, index) => (
          <p key={index} role="listitem">
            {index + 1}. {step}
          </p>
        ))}
      </div>
    </Card>
  );
}
