import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;

        if (
          pathname === '/' ||
          pathname === '/login' ||
          pathname === '/register' ||
          pathname === '/api/user/register' ||
          pathname.startsWith('/api/auth')
        ) {
          return true;
        }

        // Not logged in
        if (!token) return false;

        // INVALIDATION CHECK
        const passwordChangedAt = token.passwordChangedAt as string | undefined;
        const emailChangedAt = token.emailChangedAt as string | undefined;
        const issuedAt = token.iat as number | undefined;
        const issuedAtMs = issuedAt ? issuedAt * 1000 : 0;

        if (
          (passwordChangedAt &&
            issuedAtMs < new Date(passwordChangedAt).getTime()) ||
          (emailChangedAt && issuedAtMs < new Date(emailChangedAt).getTime())
        ) {
          return false; // force logout
        }

        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  },
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
