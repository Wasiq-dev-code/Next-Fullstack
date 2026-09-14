import { connectToDatabase } from '@/lib/database/db';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/validations/auth';
import Like from '@/model/Like.model';

// GetVideoById
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;

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

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { viewsCount: 1 } },
      { new: true, projection: { viewsCount: 1 } },
    ).lean();

    // Get current user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id
      ? new mongoose.Types.ObjectId(session.user.id)
      : null;

    const video = await Video.aggregate<any>([
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
          title: 1,
          description: 1,
          thumbnail: { url: 1 },
          video: { url: 1 },
          viewsCount: 1,
          'owner.profilePhoto.url': 1,
          'owner.username': 1,
          'owner._id': 1,
          uploadedAt: 1,
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

    // Check if user liked
    const userLiked = userId
      ? Boolean(await Like.exists({ video: videoId, userLiked: userId }))
      : false;

    const videoEntry = (video?.[0] ?? {}) as Record<string, any>;
    const updatedViews = Number(
      (updatedVideo as Record<string, any> | null)?.viewsCount ??
        videoEntry.viewsCount ??
        0,
    );
    videoEntry.likesCount = likeCount;
    videoEntry.viewsCount = updatedViews;

    return NextResponse.json(
      {
        message: 'Successfully fetched',
        data: {
          singleVideo: videoEntry,
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
