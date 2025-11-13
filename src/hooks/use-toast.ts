'use client';

import { toast as sonnerToast } from 'sonner';

type ToastVariant = 'default' | 'success' | 'warning' | 'error';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const message = description ? `${title}: ${description}` : title;

    switch (variant) {
      case 'success':
        sonnerToast.success(message, { duration });
        break;
      case 'warning':
        sonnerToast.warning(message, { duration });
        break;
      case 'error':
        sonnerToast.error(message, { duration });
        break;
      default:
        sonnerToast(message, { duration });
        break;
    }
  };

  return { toast };
}
