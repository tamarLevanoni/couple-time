"use client";

import Link from 'next/link';
import { ReactNode } from 'react';

type NavItemProps = {
  href: string;
  label: string | ReactNode;
  isActive: boolean;
  variant?: 'desktop' | 'mobile';
  onClick?: () => void;
};

export function NavItem({ href, label, isActive, variant = 'desktop', onClick }: NavItemProps) {
  if (variant === 'mobile') {
    return (
      <Link
        href={href}
        className={`block px-4 py-3.5 rounded-lg transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50 ${
          isActive
            ? 'text-indigo-700 text-brand-700 bg-indigo-50 bg-brand-50'
            : 'text-gray-800 hover:text-indigo-700 hover:text-brand-700 hover:bg-indigo-50 hover:bg-brand-50'
        }`}
        onClick={onClick}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative py-2 px-3 font-medium transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-brand-500/50 rounded-md ${
        isActive
          ? 'text-indigo-700 text-brand-700'
          : 'text-gray-800 hover:text-indigo-700 hover:text-brand-700'
      }`}
    >
      {label}
      <span
        className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 from-brand-500 to-brand-600 transform transition-transform duration-200 ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );
}


