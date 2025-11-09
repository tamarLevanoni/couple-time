import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameController } from '@/components/icons';

interface RentalEmptyStateProps {
  message: string;
}

export function RentalEmptyState({ message }: RentalEmptyStateProps) {
  const router = useRouter();

  return (
    <Card className="p-8 text-center">
      <GameController className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-lg text-gray-500 mb-2">{message}</p>
      <p className="text-sm text-gray-400 mb-4">
        בחרו משחק מהקטלוג ושלחו בקשת השאלה
      </p>
      <Button onClick={() => router.push('/games')}>
        עיינו במשחקים
      </Button>
    </Card>
  );
}
