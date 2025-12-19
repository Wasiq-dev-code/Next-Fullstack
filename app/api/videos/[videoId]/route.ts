import { connectToDatabase } from '@/lib/db';
import Video from '@/model/Video.model';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

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

    await connectToDatabase();

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
