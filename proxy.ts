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

        // Block all other routes if no token
        return !!token;
      },
    },
    pages: {
      signIn: "/login", 
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};