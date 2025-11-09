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
