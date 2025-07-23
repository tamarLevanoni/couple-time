import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    phone?: string;
    isActive?: boolean;
    needsProfileCompletion?: boolean;
    googleId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    phone?: string;
    isActive?: boolean;
    needsProfileCompletion?: boolean;
    googleId?: string;
  }
}
