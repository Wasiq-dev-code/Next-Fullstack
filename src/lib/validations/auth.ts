import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/database/db';
import bcrypt from 'bcryptjs';
import Google from 'next-auth/providers/google';
import { loginUserSchema } from '@/validators/loginUser';
import prisma from '../database/prisma';

export const authOptions: NextAuthOptions = {
  // Google and github providers are need to be implement

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials, req) {
        // 1. Validate input shape
        const parsed = loginUserSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new Error('Invalid email or password');
        }

        const { email, password } = parsed.data;

        // 2. Ensure DB connection
        await connectToDatabase();

        // 3. Find user
        // const user = await User.findOne({ email }).select(
        //   '+password +passwordChangedAt +emailChangedAt',
        // );

        const user = await prisma.user.findUnique({
          where: { email },
        });

        // 4. Generic auth failure (do NOT reveal which one)
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        // 5. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // 6. Return safe user object (NextAuth session payload)
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.profilePhotoUrl ?? undefined,
          passwordChangedAt: user.passwordChangedAt ?? undefined,
          emailChangedAt: user.emailChangedAt ?? undefined,
          provider: user.provider, // MUST
          isPrivate: user.isPrivate, // MUST
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
        token.provider = user.provider;
        token.isPrivate = user.isPrivate;
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
        session.user.provider = token.provider as string;
        session.user.isPrivate = token.isPrivate as boolean;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          if (existingUser.provider === 'credentials') {
            throw new Error(
              'Account already exists with email and password. Please login using credentials.',
            );
          }
        } else {
          if (!user.email) {
            throw new Error('Email is required for Google OAuth');
          }

          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              username: user.name ?? 'Google User',
              provider: 'google',
              profilePhotoUrl: user.image ?? null,
              profilePhotoId: 'google-oauth',
              isPrivate: false,
            },
          });
        }
        // Question..
        user.id = existingUser.id.toString();
        user.provider = existingUser.provider;
        user.isPrivate = existingUser.isPrivate;
        user.passwordChangedAt = existingUser.passwordChangedAt ?? undefined;
        user.emailChangedAt = existingUser.emailChangedAt ?? undefined;
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
