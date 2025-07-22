'use client';

import { useAuthStore } from '@/store/auth-store';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { ProfileCompletionModal } from './profile-completion-modal';
import { useSession } from 'next-auth/react';
import { Modal } from '@/components/ui/modal';

export function AuthPopupContainer() {
  const { showAuthPopup, authPopupMode, closeAuthPopup } = useAuthStore();
  const { data: session } = useSession();

  const renderContent = () => {
    switch (authPopupMode) {
      case 'login':
        return <LoginForm />;
      case 'signup':
        return <SignupForm />;
      case 'complete-profile':
        return (
          <ProfileCompletionModal 
            email={session?.user?.email || ''} 
            googleId={session?.user?.id || ''} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal 
      isOpen={showAuthPopup && !!authPopupMode}
      onClose={closeAuthPopup}
      showCloseButton={authPopupMode !== 'complete-profile'} // Don't allow closing profile completion
    >
      {renderContent()}
    </Modal>
  );
}