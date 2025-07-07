import { Role } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      roles: Role[];
      defaultDashboard?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    roles: Role[];
    defaultDashboard?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles: Role[];
    defaultDashboard?: string;
  }
}