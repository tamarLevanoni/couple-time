'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Role } from '@prisma/client';
import { 
  LayoutDashboard, 
  FileText, 
  Gamepad2, 
  Building2, 
  Users, 
  BarChart3 
} from '@/components/icons';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: 'סקירה כללית',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ['CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN'],
  },
  {
    label: 'בקשות השאלה',
    href: '/dashboard/rentals',
    icon: <FileText className="h-5 w-5" />,
    roles: ['CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN'],
  },
  {
    label: 'משחקים',
    href: '/dashboard/games',
    icon: <Gamepad2 className="h-5 w-5" />,
    roles: ['CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN'],
  },
  {
    label: 'מרכזים',
    href: '/dashboard/centers',
    icon: <Building2 className="h-5 w-5" />,
    roles: ['SUPER_COORDINATOR', 'ADMIN'],
  },
  {
    label: 'ניהול משתמשים',
    href: '/dashboard/users',
    icon: <Users className="h-5 w-5" />,
    roles: ['ADMIN'],
  },
  {
    label: 'דוחות',
    href: '/dashboard/reports',
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ['SUPER_COORDINATOR', 'ADMIN'],
  },
];

export function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRoles = session?.user.roles || [];
  const visibleNavItems = navItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-l border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">לוח בקרה</h2>
            <nav className="space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="ml-3">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className={className}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}