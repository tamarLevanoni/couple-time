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

/**
 * Creates Prisma where conditions for searching users by firstName and/or lastName
 * More precise than single field search - users can search by specific name parts
 */
export function createUserNameSearchConditions({firstName, lastName}:{firstName?: string, lastName?: string}) {
  const conditions = [];
  
  if (firstName?.trim()) {
    conditions.push({ 
      firstName: { contains: firstName.trim(), mode: 'insensitive' as const } 
    });
  }
  
  if (lastName?.trim()) {
    conditions.push({ 
      lastName: { contains: lastName.trim(), mode: 'insensitive' as const } 
    });
  }
  
  return conditions;
}

