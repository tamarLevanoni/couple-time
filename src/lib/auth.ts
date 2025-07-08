import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { logger } from './logger';

export const authOptions: NextAuthOptions = {
  // Remove adapter to simplify for testing
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Google OAuth Provider (only if credentials are available)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    
    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.authFailure('credentials_login', credentials?.email, 'Missing credentials');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            logger.authFailure('credentials_login', credentials.email, 'User not found or no password');
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            logger.authFailure('credentials_login', credentials.email, 'Invalid password');
            return null;
          }

          logger.authSuccess('credentials_login', user.id);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            roles: user.roles,
            managedCenterIds: user.managedCenterIds,
            supervisedCenterIds: user.supervisedCenterIds,
            defaultDashboard: user.defaultDashboard,
            isActive: user.isActive,
          };
        } catch (error) {
          logger.error('Auth credentials error', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            email: credentials?.email 
          });
          return null;
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, create or update user
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // Update Google ID if not set
            if (!existingUser.googleId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  googleId: account.providerAccountId,
                  image: user.image,
                },
              });
            }
          } else {
            // Create new user with Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                image: user.image,
                googleId: account.providerAccountId,
                roles: [Role.USER],
                managedCenterIds: [],
                supervisedCenterIds: [],
                isActive: true,
              },
            });
          }
        } catch (error) {
          logger.error('Google OAuth sign-in error', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            email: user.email,
            provider: account?.provider 
          });
          return false;
        }
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      try {
        // Initial sign in
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.roles = dbUser.roles;
            token.managedCenterIds = dbUser.managedCenterIds;
            token.supervisedCenterIds = dbUser.supervisedCenterIds;
            token.defaultDashboard = dbUser.defaultDashboard;
            token.isActive = dbUser.isActive;
          }
        }

        return token;
      } catch (error) {
        logger.error('JWT callback error', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userEmail: user?.email 
        });
        return token;
      }
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as Role[];
        session.user.managedCenterIds = token.managedCenterIds as string[];
        session.user.supervisedCenterIds = token.supervisedCenterIds as string[];
        session.user.defaultDashboard = token.defaultDashboard as string;
        session.user.isActive = token.isActive as boolean;
      }

      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  debug: process.env.NODE_ENV === 'development',
};

// Helper functions for role checking
export const hasRole = (user: any, role: Role): boolean => {
  return user?.roles?.includes(role) || false;
};

export const hasAnyRole = (user: any, roles: Role[]): boolean => {
  return roles.some(role => hasRole(user, role));
};

export const canManageCenter = (user: any, centerId: string): boolean => {
  return hasRole(user, Role.ADMIN) || 
         user?.managedCenterIds?.includes(centerId) ||
         user?.supervisedCenterIds?.includes(centerId);
};