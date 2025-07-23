import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatUserName(firstName?: string | null, lastName?: string | null): string {
  if (!firstName && !lastName) return 'Unknown User';
  if (!firstName) return lastName || 'Unknown User';
  if (!lastName) return firstName || 'Unknown User';
  return `${firstName} ${lastName}`;
}