import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/database/db';
import bcrypt from 'bcryptjs';
import Google from 'next-auth/providers/google';
import { loginUserSchema } from '@/validators/loginUser';
import User from '@/model/User.model';

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
        // 1. Validate input shape
        const parsed = loginUserSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // 2. Ensure DB connection
        await connectToDatabase();

        // 3. Find user
        const user = await User.findOne({
          $or: [
            { email },
            { secondaryEmail: email, secondaryEmailVerified: true },
          ],
        }).select('+password +passwordChangedAt +emailChangedAt');

        // 4. Return null if user does not exist or password missing
        if (!user || !user.password) {
          return null;
        }

        // 5. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // 6. Return user object
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          image: user.profilePhoto?.url ?? null,
          passwordChangedAt: user.passwordChangedAt ?? null,
          emailChangedAt: user.emailChangedAt ?? null,
          provider: user.provider,
          isPrivate: user.isPrivate,
          role: user.role, // ADDED
        };
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

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

        // ADDED
        token.role = user.role;
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

        // ADDED
        session.user.role = token.role as
          | 'USER'
          | 'CREATOR'
          | 'MODERATOR'
          | 'ADMIN'
          | 'SUPERADMIN';
      }

      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectToDatabase();

        // 1. Find existing user
        let existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // 2. Conflict: credentials vs google
          if (existingUser.provider === 'credentials') {
            throw new Error(
              'Account already exists with email and password. Please login using credentials.',
            );
          }
        } else {
          // 3. Create new user (Google OAuth)
          if (!user.email) {
            throw new Error('Email is required for Google OAuth');
          }

          existingUser = await User.create({
            email: user.email,
            username: user.name ?? 'Google User',
            provider: 'google',
            profilePhoto: user.image
              ? {
                  url: user.image,
                  fileId: 'google-oauth',
                }
              : undefined,
            isPrivate: false,
          });
        }

        // 4. Attach required fields to NextAuth user object
        user.id = existingUser._id.toString();
        user.provider = existingUser.provider;
        user.isPrivate = existingUser.isPrivate;
        user.passwordChangedAt =
          existingUser.passwordChangedAt ?? undefined;
        user.emailChangedAt = existingUser.emailChangedAt ?? undefined;

        // ADDED
        user.role = existingUser.role;
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