/**
 * Global fetch interceptor for handling 401 errors client-side
 * This catches cases where user deletes cookies after page load
 *
 * IMPORTANT: Only runs in browser, not during SSR
 */

let isRedirecting = false;
let isInterceptorSetup = false;

function handleUnauthorized() {
  // Prevent multiple redirects
  if (isRedirecting) return;

  isRedirecting = true;

  // Show alert
  alert('יש להתחבר על מנת לבצע פעולה זו');

  // Redirect to home
  window.location.href = '/';
}

/**
 * Setup global fetch interceptor
 * Call this once in app initialization
 */
export function setupFetchInterceptor() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Only setup once
  if (isInterceptorSetup) return;

  // Store original fetch
  const originalFetch = window.fetch;

  // Override global fetch
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch(...args);

      // Check if this is an API call (not external URLs)
      const url = args[0];
      const isApiCall = typeof url === 'string' && url.startsWith('/api/');

      // If API call returned 401, handle it
      if (isApiCall && response.status === 401) {
        handleUnauthorized();
        // Return the response anyway for error handling
        return response;
      }

      return response;
    } catch (error) {
      // Network errors or other fetch errors - just re-throw
      throw error;
    }
  };

  isInterceptorSetup = true;
}
