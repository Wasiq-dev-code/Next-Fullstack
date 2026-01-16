import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      passwordChangedAt?: string;
      emailChangedAt?: string;
      name?: string;
      image?: string;
      provider: string;
      isPrivate: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    passwordChangedAt?: Date;
    emailChangedAt?: Date;
    name?: string;
    image?: string;
    provider: string;
    isPrivate: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    passwordChangedAt?: string;
    emailChangedAt?: string;
    name?: string;
    image?: string;
    provider: string;
    isPrivate: boolean;
  }
}
