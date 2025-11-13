// Simple toast hook implementation
// For now, using console.log, can be replaced with a proper toast library later

type ToastVariant = 'default' | 'success' | 'warning' | 'error';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    // Simple console implementation for now
    const emoji = {
      default: '💬',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[variant];

    console.log(`${emoji} ${title}`, description || '');

    // TODO: Replace with actual toast UI implementation
    // For now, using browser alert as fallback
    if (typeof window !== 'undefined') {
      const message = description ? `${title}\n${description}` : title;
      // Could use a toast library here in the future
      console.info(message);
    }
  };

  return { toast };
}
