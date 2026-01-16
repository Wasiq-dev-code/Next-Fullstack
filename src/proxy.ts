import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // if logged-in? do not access to login and register pages
  if (
    token &&
    (pathname.startsWith('/login') || pathname.startsWith('/register'))
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Public pages routes including client pages and there apis
  const isPublicPage =
    pathname === '/' || pathname === '/login' || pathname === '/register';

  // Public APIs
  const isPublicAPI =
    pathname === '/api/user/register' ||
    pathname === '/api/videos/randomFeed' ||
    pathname.startsWith('/api/auth');

  // validating for all public route
  if (isPublicPage || isPublicAPI) {
    return NextResponse.next();
  }

  // Protected pages
  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    url.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(url);
  }

  // If user changes password or email? Will logout user's account from every device. Because we assigned passwordChangedAt and emailChangedAt in database with date type if user change anyone.
  const passwordChangedAt = token.passwordChangedAt as string | undefined;
  const emailChangedAt = token.emailChangedAt as string | undefined;
  const issuedAt = token.iat as number | undefined;
  const issuedAtMs = issuedAt ? issuedAt * 1000 : 0;

  if (
    (passwordChangedAt && issuedAtMs < new Date(passwordChangedAt).getTime()) ||
    (emailChangedAt && issuedAtMs < new Date(emailChangedAt).getTime())
  ) {
    const url = new URL('/login', req.url);
    url.searchParams.set('error', 'session-expired');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Path where routes shouldnt go
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
