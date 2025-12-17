import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import User from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const userId = auth.data;

    const user = await User.findById(userId).select('isPrivate');

    if (!user) {
      return NextResponse.json(
        {
          error: 'user not found in database',
        },
        {
          status: 404,
        },
      );
    }

    user.isPrivate = !user.isPrivate;
    await user.save();

    return NextResponse.json(
      {
        message: user.isPrivate ? 'Profile is private' : 'Profile is public',
        isPrivate: user.isPrivate,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('private profile failed', error);
    return NextResponse.json(
      {
        error: 'Error while private profile',
      },
      {
        status: 500,
      },
    );
  }
}
