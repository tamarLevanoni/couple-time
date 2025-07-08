'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserProfile } from '@/components/auth/user-profile';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">ז</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">זמן זוגי</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              דף הבית
            </Link>
            <Link
              href="/games"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              משחקים
            </Link>
            <Link
              href="/centers"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              מרכזים
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              אודות
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {session ? (
              <UserProfile />
            ) : (
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  התחבר
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  הירשם
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                דף הבית
              </Link>
              <Link
                href="/games"
                className="text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                משחקים
              </Link>
              <Link
                href="/centers"
                className="text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                מרכזים
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                אודות
              </Link>
              {!session && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    התחבר
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    הירשם
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}