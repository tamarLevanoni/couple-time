import { RentalStatus } from '@/types';

/**
 * Gets Hebrew label for rental status
 */
export function getRentalStatusLabel(status: RentalStatus): string {
  const labels: Record<RentalStatus, string> = {
    PENDING: 'ממתין לאישור',
    ACTIVE: 'פעיל',
    RETURNED: 'הוחזר',
    CANCELLED: 'בוטל'
  };
  return labels[status];
}

/**
 * Gets Tailwind color classes for rental status badge
 */
export function getRentalStatusColor(status: RentalStatus): string {
  const colors: Record<RentalStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    RETURNED: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status];
}

/**
 * Formats date in Hebrew locale (long format)
 */
export function formatDateHebrew(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
