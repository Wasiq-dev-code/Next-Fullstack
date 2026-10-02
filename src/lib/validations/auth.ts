import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/database/db';
import bcrypt from 'bcryptjs';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { loginUserSchema } from '@/validators/loginUser';
import User from '@/model/User.model';
import { cookies } from 'next/headers';
import {
  OAUTH_CAPTCHA_COOKIE,
  isValidOAuthCaptchaProof,
  verifyRecaptchaV3Token,
  verifyTurnstileToken,
} from '@/lib/captcha';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        captchaToken: { label: 'Security check', type: 'text' },
        recaptchaToken: { label: 'reCAPTCHA', type: 'text' },
      },

      async authorize(credentials) {
        // 1. Validate input shape
        const parsed = loginUserSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password, captchaToken, recaptchaToken } = parsed.data;

        if (
          !(await verifyTurnstileToken(captchaToken, 'login')) ||
          !(await verifyRecaptchaV3Token(recaptchaToken, 'login'))
        ) {
          return null;
        }

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
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read:user user:email' },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial login / credential sign-in
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
        token.role = user.role;
      }

      // 2. Handle manual session updates (e.g., after upgrading to CREATOR)
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
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
      if (account?.provider === 'google' || account?.provider === 'github') {
        const provider = account.provider;
        const cookieStore = await cookies();
        const captchaProof = cookieStore.get(OAUTH_CAPTCHA_COOKIE)?.value;
        cookieStore.set(OAUTH_CAPTCHA_COOKIE, '', {
          path: '/api/auth/callback/google',
          maxAge: 0,
        });
        cookieStore.set(OAUTH_CAPTCHA_COOKIE, '', {
          path: '/api/auth/callback/github',
          maxAge: 0,
        });
        if (!isValidOAuthCaptchaProof(captchaProof, provider)) return false;

        await connectToDatabase();

        const email = user.email?.trim().toLowerCase();
        if (!email) {
          throw new Error(`${provider === 'github' ? 'GitHub' : 'Google'} did not provide an email address.`);
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
          if (existingUser.provider === 'credentials') {
            throw new Error(
              'An account already exists with this email and password. Please sign in with your password.',
            );
          }
        } else {
          existingUser = await User.create({
            email,
            username: user.name ?? email.split('@')[0],
            provider,
            profilePhoto: user.image
              ? {
                  url: user.image,
                  fileId: `${provider}-oauth`,
                }
              : undefined,
              isPrivate: false,
              isVerified: true,
          });
        }

        user.id = existingUser._id.toString();
        user.provider = existingUser.provider;
        user.isPrivate = existingUser.isPrivate;
        user.passwordChangedAt =
          existingUser.passwordChangedAt ?? undefined;
        user.emailChangedAt = existingUser.emailChangedAt ?? undefined;

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