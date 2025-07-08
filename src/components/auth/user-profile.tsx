'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Role } from '@prisma/client';
import { ChevronDown } from '@/components/icons';

const roleNames: Record<Role, string> = {
  USER: 'משתמש',
  CENTER_COORDINATOR: 'רכז מרכז',
  SUPER_COORDINATOR: 'רכז על',
  ADMIN: 'מנהל מערכת',
};

export function UserProfile() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const primaryRole = session.user.roles?.[0];
  const displayName = session.user.name || session.user.email;

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 space-x-reverse text-sm bg-white border border-gray-300 rounded-full px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="flex-shrink-0">
          {session.user.image ? (
            <img
              className="h-6 w-6 rounded-full"
              src={session.user.image}
              alt="תמונת פרופיל"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-gray-700 truncate max-w-32">{displayName}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500" dir="ltr">{session.user.email}</p>
              {primaryRole && (
                <p className="text-xs text-primary mt-1">
                  {roleNames[primaryRole]}
                </p>
              )}
            </div>

            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              פרופיל אישי
            </a>

            {(session.user.roles?.includes('CENTER_COORDINATOR') || 
              session.user.roles?.includes('SUPER_COORDINATOR') || 
              session.user.roles?.includes('ADMIN')) && (
              <a
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                לוח בקרה
              </a>
            )}

            {session.user.roles?.includes('ADMIN') && (
              <a
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                ניהול מערכת
              </a>
            )}

            <div className="border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                התנתק
              </button>
            </div>
          </div>
        </div>
      )}

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}