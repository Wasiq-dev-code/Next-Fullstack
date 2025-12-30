import User from '@/model/User.model';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './db';
import bcrypt from 'bcryptjs';
import Google from 'next-auth/providers/google';

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
          name: user.username,
          image: user.profilePhoto.url,
          passwordChangedAt: user.passwordChangedAt,
          emailChangedAt: user.emailChangedAt,
        };
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // Extra work needed on callback
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image ?? undefined;
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
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.passwordChangedAt = token.passwordChangedAt
          ? new Date(token.passwordChangedAt).toISOString()
          : undefined;
        session.user.emailChangedAt = token.emailChangedAt
          ? new Date(token.emailChangedAt).toISOString()
          : undefined;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectToDatabase();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            email: user.email,
            username: user.name ?? 'Google User',
            profilePhoto: user.image
              ? {
                  url: user.image,
                  fileId: 'google-oauth',
                }
              : undefined,
          });
        }
      }
      return true;
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
