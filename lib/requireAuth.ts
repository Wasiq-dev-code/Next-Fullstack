import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Result } from './types/result';

export async function requireAuth(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('Unauthecticated User');
    return {
      ok: false,
      error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    };
  }

  const userId = session.user.id;

  return { ok: true, data: userId };
}
