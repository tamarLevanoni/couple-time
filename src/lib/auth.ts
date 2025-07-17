import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // User exists - link Google account if not already linked
            if (!existingUser.googleId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { googleId: account.providerAccountId },
              });
            }
            return true;
          } else {
            // New user - redirect to complete profile if missing name/phone
            // This will be handled by checking profile completeness in JWT callback
            return true;
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      
      if (user) {
        // User object from credentials provider
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.roles = user.roles;
      } else {
        // Handle Google OAuth
        if (account?.provider === 'google') {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: token.email! },
          });

          if (existingUser) {
            // Existing user - use their data
            token.id = existingUser.id;
            token.email = existingUser.email;
            token.name = existingUser.name;
            token.roles = existingUser.roles;
          } else {
            // New Google user - always needs to complete profile (name and phone)
            token.needsProfileCompletion = true;
            token.googleId = account.providerAccountId;
            token.email = token.email;
            // Don't trust Google's name - user must provide their own
            token.name = profile?.name || "";
          }
        } else {
          // For OAuth or subsequent requests, ensure we have all required fields
          if (!token.id) token.id = token.sub!;
          if (!token.email) token.email = token.email!;
          if (!token.name) token.name = token.name!;
          
          // Fetch user data for OAuth or if roles missing
          if (account || !token.roles) {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id || token.sub },
              select: { 
                id: true,
                email: true, 
                name: true,
                phone: true,
                roles: true,
                isActive: true
              },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.phone = dbUser.phone;
              token.roles = dbUser.roles;
              token.isActive = dbUser.isActive;
            }
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Ensure session follows the JWT interface
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.phone = token.phone;
      session.user.roles = token.roles;
      session.user.isActive = token.isActive;
      session.user.needsProfileCompletion = token.needsProfileCompletion;
      session.user.googleId = token.googleId;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};