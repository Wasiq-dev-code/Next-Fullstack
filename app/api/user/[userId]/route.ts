import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/model/User.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    const viewerUserId = session?.user?.id || null;

    const targetUserId = params.userId === 'me' ? viewerUserId : params.userId;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    await connectToDatabase();

    const viewerObjectId = viewerUserId
      ? new mongoose.Types.ObjectId(viewerUserId)
      : null;

    const profile = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(targetUserId) },
      },

      // Followers of this profile
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'account',
          as: 'followers',
        },
      },

      // Accounts this profile follows
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

      // Check if logged-in user follows THIS profile
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
          email: 1,
          profilePhoto: 1,
          followersCount: 1,
          followToCount: 1,
          isFollowed: 1,
        },
      },
    ]);

    if (!profile.length) {
      return NextResponse.json(
        { error: 'Profile is not provided' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        profile: profile[0],
        message: 'Profile Fetched Successfully',
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
