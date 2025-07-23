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
          firstName: user.firstName,
          lastName: user.lastName,
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
      console.log("account signIn", account)
      console.log("profile signIn", profile)
      console.log("user signIn", user)
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
            console.log('✅ Existing Google user signed in', { userId: existingUser.id });
            return true;
          } else {
            const name=user.name?.split(" ")||[];
            // Create new user record immediately
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName: name[0] || '', // May be empty - will trigger profile completion
                lastName: name[1] || '',
                phone:'',
                googleId: account.providerAccountId,
                roles: [], // No roles until profile is completed
                isActive: false,
                // phone is not set - will trigger profile completion
              },
            });
            user.needsProfileCompletion=true;
            user.id=newUser.id;
            user.googleId=account.providerAccountId;
            console.log('🆕 New Google user created', { userId: newUser.id });
            return true;
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      
      if (user) {
        console.log("user 1", user)
        // User object from credentials provider
        token.id=user.id;
        token.email=user.email;
        token.firstName=user.firstName;
        token.lastName=user.lastName;
        token.googleId=user.googleId;
        token.roles=user.roles;
        token.needsProfileCompletion=user.needsProfileCompletion;
      } else {
        // For all non-initial requests, fetch user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { 
            id: true,
            email: true, 
            firstName: true,
            lastName: true,
            phone: true,
            roles: true,
            isActive: true,
            googleId: true
          },
        });
        
        if (dbUser) {
          console.log('🔄 Fetched user data for token', { userId: dbUser.id });
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.roles = dbUser.roles;
          token.googleId = dbUser.googleId ? dbUser.googleId : undefined;
          
          // Determine if profile completion is needed based on actual data
          token.needsProfileCompletion = !!dbUser.googleId && !dbUser.isActive;
        } else {
          console.log('⚠️ No user found for token email', { email: token.email });
          // Fallback - keep existing token data
          if (!token.id) token.id = token.sub!;
        }
      }
      
      console.log('🎯 JWT token result', { 
        id: token.id, 
        email: token.email, 
        googleId: token.googleId, 
        needsProfileCompletion: token.needsProfileCompletion,
        hasRoles: !!token.roles?.length 
      });
      
      return token;
    },
    async session({ session, token }) {
      // Ensure session follows the JWT interface
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.roles = token.roles;
      session.user.needsProfileCompletion = token.needsProfileCompletion;
      session.user.googleId = token.googleId;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};