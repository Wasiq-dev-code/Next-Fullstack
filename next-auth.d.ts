import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {

  interface Session {
    user: {
      id: string;
      passwordChangedAt: Date;
    } & DefaultSession["user"]
  }

  interface User {
    passwordChangedAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    passwordChangedAt?: Date;
  }
}