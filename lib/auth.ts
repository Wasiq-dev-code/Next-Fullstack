import User from '@/model/User.model';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // Google and github providers are need to be implement
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and Password are required');
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        if (!user) throw new Error('No user found');

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) throw new Error('Invalid password');

        return {
          id: user._id.toString(),
          email: user.email,
          passwordChangedAt: user.passwordChangedAt,
          emailChangedAt: user.emailChangedAt,
        };
      },
    }),
  ],
  // Extra work needed on callback
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.passwordChangedAt = user.passwordChangedAt
          ? new Date(user.passwordChangedAt).toISOString()
          : undefined;
        token.emailChangedAt = user.emailChangedAt
          ? new Date(user.emailChangedAt).toISOString()
          : undefined;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.passwordChangedAt = token.passwordChangedAt
          ? new Date(token.passwordChangedAt).toISOString()
          : undefined;
        session.user.emailChangedAt = token.emailChangedAt
          ? new Date(token.emailChangedAt).toISOString()
          : undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
