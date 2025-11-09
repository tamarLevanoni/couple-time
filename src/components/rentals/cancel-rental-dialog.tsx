import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CancelRentalDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelRentalDialog({ isOpen, onConfirm, onCancel }: CancelRentalDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ביטול בקשת השאלה
        </h3>
        <p className="text-gray-600 mb-6">
          האם אתם בטוחים שברצונכם לבטל את הבקשה? פעולה זו אינה ניתנת לביטול.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            חזור
          </Button>
          <Button
            onClick={onConfirm}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            כן, בטל בקשה
          </Button>
        </div>
      </Card>
    </div>
  );
}
