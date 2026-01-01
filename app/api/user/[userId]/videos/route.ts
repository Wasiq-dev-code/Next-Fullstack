import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import { VideoQuery } from '@/lib/types/result';
import User from '@/model/User.model';
import Video from '@/model/Video.model';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

// ProfileVideos Route
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await connectToDatabase();

    const { userId } = await params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // Soft auth (optional)
    const auth = await requireAuth();
    const authUserId = auth.ok ? auth.data : null;

    const user = await User.findById(userId).select('+isPrivate');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Private profile protection
    if (user.isPrivate && authUserId !== userId) {
      return NextResponse.json(
        {
          message: 'Profile is private',
          videos: [],
          nextCursor: null,
        },
        { status: 200 },
      );
    }

    const { searchParams } = req.nextUrl;
    const cursor = searchParams.get('cursor');

    if (cursor && isNaN(Date.parse(cursor))) {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }

    const LIMIT = 10;

    const query: VideoQuery = {
      owner: new mongoose.Types.ObjectId(userId),
      ...(cursor && { createdAt: { $lt: new Date(cursor) } }),
    };

    const videos = await Video.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $limit: LIMIT },

      // owner info
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },

      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'video',
          as: 'likes',
        },
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          'thumbnail.url': 1,
          createdAt: 1,
          likesCount: 1,
          owner: {
            _id: '$owner._id',
            username: '$owner.username',
            profilePhoto: '$owner.profilePhoto',
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        videos,
        nextCursor:
          videos.length > 0
            ? videos[videos.length - 1].createdAt.toISOString()
            : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get user videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 },
    );
  }
}
