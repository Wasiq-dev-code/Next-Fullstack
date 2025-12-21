import { connectToDatabase } from '@/lib/db';
import Video from '@/model/Video.model';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Like from '@/model/Like.model';

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

    // Get current user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id
      ? new mongoose.Types.ObjectId(session.user.id)
      : null;

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
                profilePhoto: 1,
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
        $addFields: {
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
          thumbnail: { fileId: 0 },
          video: { fileId: 0 },
          randomScore: 0,
          createdAt: 0,
          updatedAt: 0,
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

    // Count likes
    const likeCount = await Like.countDocuments({ video: videoId });

    if (!likeCount) {
      return NextResponse.json(
        {
          error: 'Like count in video is not available',
        },
        {
          status: 404,
        },
      );
    }

    // Check if user liked
    const userLiked = userId
      ? await Like.exists({ video: videoId, userLiked: userId })
      : false;

    return NextResponse.json(
      {
        message: 'Successfully fetched',
        data: {
          singleVideo: video[0],
          likeCount: likeCount,
          isLiked: userLiked,
        },
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
