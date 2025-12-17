import { connectToDatabase } from '@/lib/db';
import Video from '@/model/Video.model';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

const LIMIT = 10 as const;
const MAX_EXCLUDE = 100 as const;

// getvideoByid
export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    const { videoId } = params;

    if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId.trim()) {
      return NextResponse.json(
        {
          error: 'Invalid videoId',
        },
        {
          status: 400,
        },
      );
    }

    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            {
              $match: { isPrivate: false },
            },
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: { $first: '$owner' },
        },
      },

      {
        $lookup: {
          from: 'likes',
          let: { fetchVideoId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$video', '$$fetchVideoId'] } } },
            {
              $count: 'count',
            },
          ],
          as: 'likes',
        },
      },

      {
        $addFields: {
          likes: {
            $ifNull: [{ $first: '$likes.count' }, 0],
          },
          uploadedAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M',
              date: '$createdAt',
            },
          },
        },
      },

      {
        $project: {
          isPrivate: 0,
          controls: 0,
          thumbnail: { fileId: 0 },
          video: { fileId: 0 },
        },
      },
    ]);

    if (!video?.[0]) {
      return NextResponse.json(
        {
          error: 'video not found',
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: 'Successfully fetched',
        video: video[0],
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('Fetching video failed', error);
    return NextResponse.json(
      {
        error: 'Error while fetching video',
      },
      {
        status: 500,
      },
    );
  }
}

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
      .sort({ randomScore: 1 })
      .limit(LIMIT)
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
