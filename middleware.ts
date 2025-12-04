import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware() {
    return NextResponse.next()
  },

  {
    callbacks: {
       authorized({ req , token }) {
     const {pathname} = req.nextUrl;

     if(
      pathname.startsWith("/api/auth")||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/" ||
      pathname === "/api/auth/register"
     )
     {
        return true
     }
     return !!token
      }
    }
  }

)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}