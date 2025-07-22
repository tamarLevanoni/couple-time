'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useHasPrivilegedRole, useUserProfile } from '@/store';
import { useAuthStore } from '@/store/auth-store';

export function Header() {
  const { data: session } = useSession();
  const userProfile = useUserProfile();
  const hasPrivilegedRole = useHasPrivilegedRole();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">זמן זוגי</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              בית
            </Link>
            <Link href="/games" className="text-gray-600 hover:text-gray-900">
              משחקים
            </Link>
            <Link href="/centers" className="text-gray-600 hover:text-gray-900">
              מוקדים
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {session ? (
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm text-gray-600">
                  שלום {userProfile?.name || session.user.name}
                </span>
                
                {/* Dashboard Link for privileged users */}
                {hasPrivilegedRole && (
                  <Button variant="outline" size="sm">
                    <Link href="/dashboard">לוח בקרה</Link>
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  <Link href="/profile">הפרטים שלי</Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                >
                  יציאה
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => useAuthStore.getState().openAuthPopup('login')}
                >
                  התחברות
                </Button>
                <Button 
                  size="sm"
                  onClick={() => useAuthStore.getState().openAuthPopup('signup')}
                >
                  הרשמה
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}