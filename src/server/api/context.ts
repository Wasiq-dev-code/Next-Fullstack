import { connectToDatabase } from '@/lib/database/db';
import Comment from '@/model/Comment.model';
import Like from '@/model/Like.model';
import { authOptions } from '@/lib/validations/auth';
import { getServerSession } from 'next-auth';

export async function createContext() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  return {
    models: {
      Comment,
      Like,
    },
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
