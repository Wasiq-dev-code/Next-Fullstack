import { authOptions } from '@/lib/validations/auth';
import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized Request' },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const userId = session.user.id;

    const profile = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
      },
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
        $addFields: {
          followersCount: { $size: '$followers' },
          followToCount: { $size: '$followTo' },
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          profilePhoto: 1,
          followersCount: 1,
          followToCount: 1,
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
