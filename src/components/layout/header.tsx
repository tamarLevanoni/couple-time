'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { formatUserName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/components/layout/nav-item';
import {
  useHasPrivilegedRole,
  useUserProfile,
  useIsAdmin,
  useIsCoordinator,
  useIsSuperCoordinator,
  useAuthStore
} from '@/store';
import {
  Menu as MenuIcon,
  X as XIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Heart as HeartIcon,
  ChevronDown as ChevronDownIcon,
} from '@/components/icons';

export function Header() {
  const { data: session } = useSession();
  const userProfile = useUserProfile();
  const hasPrivilegedRole = useHasPrivilegedRole();
  const isAdmin = useIsAdmin();
  const isCoordinator = useIsCoordinator();
  const isSuperCoordinator = useIsSuperCoordinator();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen((prev) => !prev);

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getUserRole = () => {
    if (isAdmin) return 'מנהל מערכת';
    if (isSuperCoordinator) return 'רכז על';
    if (isCoordinator) return 'רכז';
    return 'משתמש';
  };

  const displayName = userProfile
    ? formatUserName(userProfile.firstName, userProfile.lastName)
    : session?.user ? formatUserName(session.user.firstName, session.user.lastName) : '';

  const userInitials = userProfile
    ? getUserInitials(userProfile.firstName, userProfile.lastName)
    : session?.user ? getUserInitials(session.user.firstName, session.user.lastName) : 'U';

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 lg:h-16">
        
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-700 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
              aria-expanded={isMobileMenuOpen}
              aria-label="תפריט ניווט"
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
        
            {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full w-64 bg-white shadow-xl rounded-lg border border-gray-200 py-3 z-50">
            <nav className="space-y-1 px-2">
              <NavItem href="/" label="בית" isActive={isActive('/')} variant="mobile" onClick={() => setIsMobileMenuOpen(false)} />
              <NavItem href="/games" label="משחקים" isActive={isActive('/games')} variant="mobile" onClick={() => setIsMobileMenuOpen(false)} />
              <NavItem href="/centers" label="מוקדים" isActive={isActive('/centers')} variant="mobile" onClick={() => setIsMobileMenuOpen(false)} />
              <NavItem href="/rent" label="טופס השאלה" isActive={isActive('/rent')} variant="mobile" onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
          </div>
        )}
         
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-400 to-indigo-600 from-brand-400 to-brand-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
              </div>
              <div className="mr-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                  זמן זוגי
                </span>
                <p className="text-xs text-gray-600 font-medium">מערכת השכרת משחקים</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8">
            <NavItem href="/" label="בית" isActive={isActive('/')} />
            <NavItem href="/games" label="משחקים" isActive={isActive('/games')} />
            <NavItem href="/centers" label="מוקדים" isActive={isActive('/centers')} />
            <NavItem href="/rent" label="טופס השאלה" isActive={isActive('/rent')} />
          </nav>

          {/* Right Section - Auth & User Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {session ? (
              <div className="flex items-center space-x-3 space-x-reverse">

                {/* Dashboard Link for privileged users */}
                {isAdmin && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center space-x-2 space-x-reverse border-indigo-200 border-brand-200 text-indigo-700 text-brand-700 hover:bg-indigo-50 hover:bg-brand-50 hover:border-indigo-300 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50"
                    >
                      <LayoutDashboardIcon className="w-4 h-4" />
                      <span>לוח בקרה</span>
                    </Button>
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {userInitials}
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-600">{getUserRole()}</p>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="fixed left-4 top-14 w-72 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 divide-y divide-gray-100 origin-top-right transform transition ease-out duration-150 motion-reduce:transition-none motion-reduce:transform-none">
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-600">{getUserRole()}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50 rounded-md"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>הפרטים שלי</span>
                        </Link>

                        <Link
                          href="/profile#my-rentals"
                          className="flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 rounded-md"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <HeartIcon className="w-4 h-4" />
                          <span>ההשאלות שלי</span>
                        </Link>
                      </div>

                      {isCoordinator && (
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50 rounded-md"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <LayoutDashboardIcon className="w-4 h-4" />
                            <span>לוח השאלות</span>
                          </Link>
                        </div>
                      )}

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            signOut();
                          }}
                          className="flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 rounded-md"
                        >
                          <LogOutIcon className="w-4 h-4" />
                          <span>יציאה</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useAuthStore.getState().openAuthPopup('login')}
                  className="text-gray-800 hover:text-indigo-700 hover:text-brand-700 hover:bg-indigo-50 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50"
                >
                  התחברות
                </Button>
                <Button
                  size="sm"
                  onClick={() => useAuthStore.getState().openAuthPopup('signup')}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 from-brand-500 to-brand-600 hover:from-indigo-600 hover:to-indigo-700 hover:from-brand-600 hover:to-brand-700 active:from-indigo-700 active:to-indigo-800 active:from-brand-700 active:to-brand-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50"
                >
                  הרשמה
                </Button>
              </div>
            )}

          </div>
        </div>

     
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}