import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUserName(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return '';
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ') || '';
}

export function createUserNameSearchConditions(userData: { firstName?: string; lastName?: string }) {
  const conditions: any[] = [];

  if (userData.firstName) {
    conditions.push({
      firstName: {
        contains: userData.firstName,
        mode: 'insensitive' as const,
      },
    });
  }

  if (userData.lastName) {
    conditions.push({
      lastName: {
        contains: userData.lastName,
        mode: 'insensitive' as const,
      },
    });
  }

  return conditions;
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}
