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
    async jwt({ token, user, account }) {
      if (user) {
        // User object from credentials provider
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.roles = user.roles;
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
              roles: true 
            },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.roles = dbUser.roles;
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
      session.user.roles = token.roles;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};