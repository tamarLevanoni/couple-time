import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    name: string;
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
    name: string;
    roles: Role[];
    phone?: string;
    isActive?: boolean;
    needsProfileCompletion?: boolean;
    googleId?: string;
  }
}
