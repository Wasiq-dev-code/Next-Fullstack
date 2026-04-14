import prisma from '@/lib/database/prisma';
import { authOptions } from '@/lib/validations/auth';
import { getServerSession } from 'next-auth';

export async function createContext() {
  const session = await getServerSession(authOptions);

  return {
    prisma,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
