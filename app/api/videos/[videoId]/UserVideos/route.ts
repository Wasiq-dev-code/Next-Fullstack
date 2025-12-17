// getotherprofilevideos

import { connectToDatabase } from '@/lib/db';
import { VideoQuery } from '@/lib/types/result';
import User from '@/model/User.model';
import Video from '@/model/Video.model';
import mongoose from 'mongoose';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    await connectToDatabase();

    const { userId } = params;
    const user = await User.findById(userId).select('isPrivate');

    if (!user) {
      return NextResponse.json(
        {
          error: 'user not found in database',
        },
        {
          status: 404,
        },
      );
    }

    if (!user || user.isPrivate) {
      return NextResponse.json(
        {
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

    const LIMIT = 10 as const;

    const query: VideoQuery = {
      owner: new mongoose.Types.ObjectId(userId),
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const videos = await Video.find(query)
      .select('-thumbnail.fileId -video.fileId ')
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .lean();

    return NextResponse.json(
      {
        videos,
        nextCursor:
          videos.length > 0
            ? videos[videos.length - 1].createdAt.toISOString()
            : null,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('Get user videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 },
    );
  }
}
