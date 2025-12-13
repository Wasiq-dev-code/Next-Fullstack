import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;

        
        if (
          pathname === "/" ||
          pathname === "/login" ||          
          pathname === "/register" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Not logged in
        if (!token) return false;

        // PASSWORD CHANGE INVALIDATION CHECK
        const passwordChangedAt = token.passwordChangedAt as string | undefined
        const issuedAt = token.iat as number | undefined

        if(
          passwordChangedAt && 
          issuedAt && 
          issuedAt * 1000 < new Date(passwordChangedAt).getTime()
        ) {
          return false // force logout
        }

        return true
      },
    },
    pages: {
      signIn: "/login", 
    },
  }
);

export const config = {
  matcher: [
    // "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    "/api/:path*"
  ],
};