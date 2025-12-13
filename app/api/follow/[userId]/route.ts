import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Follow from '@/model/Follow.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followerId = session.user.id;
    const accountId = params.id;

    if (followerId === accountId) {
      return NextResponse.json(
        { error: "You can't follow yourself" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const existing = await Follow.findOne({
      follower: followerId,
      account: accountId,
    });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });

      return NextResponse.json({
        followed: false,
        message: 'Unfollowed successfully',
      });
    }

    await Follow.create({
      follower: followerId,
      account: accountId,
    });

    return NextResponse.json({
      followed: true,
      message: 'Followed successfully',
    });
  } catch (error) {
    console.error('Follow/unfollow operation failed', error);
    return NextResponse.json(
      {
        error: 'Error occur while Follow/unfollow',
      },
      {
        status: 500,
      },
    );
  }
}
