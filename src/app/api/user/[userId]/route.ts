import { authOptions } from '@/lib/validations/auth';
import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Profile Information Route
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const viewerUserId = session?.user?.id || null;

    const targetUserId = userId === 'me' ? viewerUserId : userId;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    await connectToDatabase();

    const viewerObjectId = viewerUserId
      ? new mongoose.Types.ObjectId(viewerUserId)
      : null;

    const profile = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(targetUserId) } },

      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'account',
          as: 'followers',
        },
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'follower',
          as: 'followTo',
        },
      },
      {
        $lookup: {
          from: 'videos',
          localField: '_id',
          foreignField: 'owner',
          as: 'videos',
        },
      },

      {
        $addFields: {
          followersCount: { $size: '$followers' },
          followToCount: { $size: '$followTo' },
          postsCount: { $size: '$videos' },

          isFollowed: viewerObjectId
            ? {
                $in: [
                  viewerObjectId,
                  {
                    $map: {
                      input: '$followers',
                      as: 'f',
                      in: '$$f.follower',
                    },
                  },
                ],
              }
            : false,

          isMe: viewerObjectId ? { $eq: ['$_id', viewerObjectId] } : false,
        },
      },

      {
        $project: {
          username: 1,
          profilePhoto: 1,
          followersCount: 1,
          followToCount: 1,
          postsCount: 1,
          isFollowed: 1,
          isMe: 1,
        },
      },
    ]);

    if (!profile.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: profile[0],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Profile fetching failed', error);
    return NextResponse.json(
      { error: 'Error while fetching profile' },
      { status: 500 },
    );
  }
}
