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

    const videos = await Video.find({
      randomScore: { $gt: cursor },
      _id: { $nin: limitedExcludeIds },
    })
      .select(
        '-thumbnail.fileId -video -isPrivate -randomScore -controls -transformation',
      )
      .sort({ randomScore: 1 })
      .limit(LIMIT)
      .populate('owner', 'username profilePhoto')
      .lean();

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
