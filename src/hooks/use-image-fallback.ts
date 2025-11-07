import { useState } from 'react';

/**
 * Custom hook to handle image loading errors with fallback
 * Returns whether the image failed to load and a handler for the error event
 *
 * @example
 * const { hasError, handleError } = useImageFallback();
 *
 * <img
 *   src={imageUrl}
 *   onError={handleError}
 *   style={{ display: hasError ? 'none' : 'block' }}
 * />
 */
export function useImageFallback() {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const reset = () => {
    setHasError(false);
  };

  return { hasError, handleError, reset };
}

/**
 * Custom hook to track multiple image failures by ID
 * Useful for lists of images where each needs independent error tracking
 *
 * @example
 * const { hasFailed, handleError } = useImageFallbackById();
 *
 * images.map(img => (
 *   <img
 *     key={img.id}
 *     src={img.url}
 *     onError={() => handleError(img.id)}
 *     style={{ display: hasFailed(img.id) ? 'none' : 'block' }}
 *   />
 * ))
 */
export function useImageFallbackById() {
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const handleError = (id: string) => {
    setFailedIds(prev => new Set(prev).add(id));
  };

  const hasFailed = (id: string) => {
    return failedIds.has(id);
  };

  const reset = (id?: string) => {
    if (id) {
      setFailedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setFailedIds(new Set());
    }
  };

  return { hasFailed, handleError, reset };
}
