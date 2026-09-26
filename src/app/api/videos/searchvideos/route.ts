import { connectToDatabase } from '@/lib/database/db';
import Video from '@/model/Video.model';

import { NextRequest, NextResponse } from 'next/server';

const LIMIT = 10 as const;
// const MAX_EXCLUDE = 100 as const;

// Random videos feed
export async function POST(req: NextRequest) {
  try {
    try {
      await connectToDatabase();
    } catch (error) {
      console.log('Error', error);
    }
    const body = await req.json();

    // console.log('Body', body);

    // const { excludeIds = [], query } = body;



    // // Length will not grow beyond 100
    // const limitedExcludeIds = excludeIds.slice(-MAX_EXCLUDE);
    const { query, cursor } = body;

    if (typeof query !== 'string') {
      return NextResponse.json(
      { error: 'Query must be a string' },
      { status: 400 },
        );
      }

      const searchQuery = query.trim();

    if (!searchQuery) {
       return NextResponse.json(
        { error: 'Search query cannot be empty' },
        { status: 400 },
        );
    }

     const escapeQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');// Escape special characters for regex
    const match: Record<string, unknown> = {
  $or: [
    {
      title: {
        $regex: escapeQuery,
        $options: 'i',
      },
    },
    {
      description: {
        $regex: escapeQuery,
        $options: 'i',
      },
    },
  ],
};

if (cursor) {
  const cursorDate = new Date(cursor);

  if (Number.isNaN(cursorDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid cursor' },
      { status: 400 },
    );
  }

  match.createdAt = {
    $lt: cursorDate,
  };
}

    const videos = await Video.aggregate([
      { $match: match },
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
  viewsCount: 1,

  owner: {
    _id: '$owner._id',
    username: '$owner.username',
    profilePhoto: '$owner.profilePhoto',
  },
},
      },
    ]);

    if (videos.length === 0) {
  return NextResponse.json({
    videos: [],
    query: searchQuery,
    nextCursor: null,
  });
}

const nextCursor =
  videos.length === LIMIT
    ? videos[videos.length - 1].createdAt.toISOString()
    : null;

return NextResponse.json({
  videos,
  query: searchQuery,
  nextCursor,
});
  } catch (error) {
    console.error(':', error);
    return NextResponse.json(
     { error: 'Failed to fetch search videos' },
      { status: 500 },
    );
  }
}
