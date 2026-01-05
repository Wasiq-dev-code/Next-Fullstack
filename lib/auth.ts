import User from '@/model/User.model';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './db';
import bcrypt from 'bcryptjs';
import Google from 'next-auth/providers/google';
import { loginUserSchema } from './validators/loginUser';

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
          throw new Error('Invalid email or password');
        }

        const { email, password } = parsed.data;

        // 2. Ensure DB connection
        await connectToDatabase();

        // 3. Find user
        const user = await User.findOne({ email }).select(
          '+password +passwordChangedAt +emailChangedAt',
        );

        // 4. Generic auth failure (do NOT reveal which one)
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // 5. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // 6. Return safe user object (NextAuth session payload)
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          image: user.profilePhoto?.url ?? null,
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

        let existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          if (existingUser.provider === 'credentials') {
            throw new Error(
              'Account already exists with email and password. Please login using credentials.',
            );
          }
        } else {
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
          });
        }
        // Question..
        user.id = existingUser._id.toString();
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
