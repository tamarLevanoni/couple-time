import NextAuth from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      roles: Role[];
      managedCenterIds: string[];
      supervisedCenterIds: string[];
      defaultDashboard?: string;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    roles: Role[];
    managedCenterIds: string[];
    supervisedCenterIds: string[];
    defaultDashboard?: string;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: Role[];
    managedCenterIds: string[];
    supervisedCenterIds: string[];
    defaultDashboard?: string;
    isActive: boolean;
  }
}