import { connectToDatabase } from '@/src/lib/db';
import Video from '@/src/model/Video.model';

import { NextRequest, NextResponse } from 'next/server';

const LIMIT = 10 as const;
const MAX_EXCLUDE = 100 as const;

// Random videos feed
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // console.log('Body', body);

    const { excludeIds, cursor } = body;

    // Length will not grow beyond 100
    const limitedExcludeIds = excludeIds.slice(-MAX_EXCLUDE);

    const match: any = {
      _id: { $nin: limitedExcludeIds },
    };

    if (cursor !== null) {
      match.randomScore = { $gt: cursor };
    }

    const videos = await Video.aggregate([
      { $match: match },
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
