import { signIn } from 'next-auth/react';

export async function handleGoogleOAuth(): Promise<{ success: boolean; error?: string }> {
  try {
    // Google OAuth will redirect to Google and back to current page
    const currentUrl = window.location.href;
    
    // Use signIn with current page as callback to stay on same page after auth
    await signIn('google', { 
      callbackUrl: currentUrl,
      redirect: true // This will redirect to Google, then back to same page
    });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'שגיאה בהתחברות עם Google' 
    };
  }
}