import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      passwordChangedAt?: string;
      emailChangedAt?: string;
    } & DefaultSession['user'];
  }

  interface User {
    passwordChangedAt?: Date;
    emailChangedAt?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    passwordChangedAt?: string;
    emailChangedAt?: string;
  }
}
