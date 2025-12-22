import { connectToDatabase } from '@/lib/db';
import Video from '@/model/Video.model';

import { NextRequest, NextResponse } from 'next/server';

const LIMIT = 10 as const;
const MAX_EXCLUDE = 100 as const;

// Random videos feed
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { excludeIds = [], cursor = 0 } = await req.json();

    const limitedExcludeIds = excludeIds.slice(-MAX_EXCLUDE);

    const videos = await Video.aggregate([
      {
        $match: {
          randomScore: { $gt: cursor },
          _id: { $nin: limitedExcludeIds },
        },
      },
      { $sort: { randomScore: 1 } },
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

      // likes count
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

      // final shape
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

    return NextResponse.json({
      videos,
      nextCursor:
        videos.length > 0 ? videos[videos.length - 1].randomScore : null,
    });
  } catch (error) {
    console.error('Random feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random videos' },
      { status: 500 },
    );
  }
}
