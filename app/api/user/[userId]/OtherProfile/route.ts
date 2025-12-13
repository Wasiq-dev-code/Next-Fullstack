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
    const profileUserId = params.userId;
    const session = await getServerSession(authOptions);

    if (!profileUserId) {
      return NextResponse.json(
        { error: 'UserId is not available in param' },
        { status: 400 },
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized Request' },
        { status: 401 },
      );
    }

    const viewerUserId = session.user.id;

    await connectToDatabase();

    const profile = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(profileUserId) },
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

      // Check if logged-in user follows THIS profile
      {
        $addFields: {
          followersCount: { $size: '$followers' },
          followToCount: { $size: '$followTo' },

          isFollowed: {
            $in: [
              new mongoose.Types.ObjectId(viewerUserId),
              {
                $map: {
                  input: '$followers',
                  as: 'f',
                  in: '$$f.follower',
                },
              },
            ],
          },
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
        profile,
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
