import { connectToDatabase } from '@/lib/database/db';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/validations/auth';
import Like from '@/model/Like.model';
import { recordVideoView } from '@/lib/analytics/recordView';

// GetVideoById
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;

    if (!mongoose.Types.ObjectId.isValid(videoId) || !videoId.trim()) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    await connectToDatabase();

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
      return NextResponse.json({ error: 'video not found' }, { status: 404 });
    }

    const videoEntry = video[0] as Record<string, any>;

    // Record the view only now that the video exists and we know its owner.
    // Wrapped so an analytics failure never breaks fetching the video.
    let viewsCount = Number(videoEntry.viewsCount ?? 0);
    try {
      if (videoEntry.owner?._id) {
        const { recorded } = await recordVideoView({
          videoId: videoEntry._id,
          ownerId: videoEntry.owner._id,
          viewerId: session?.user?.id,
        });

        if (recorded) {
          const updated = await Video.findByIdAndUpdate(
            videoId,
            { $inc: { viewsCount: 1 } },
            { new: true, projection: { viewsCount: 1 } },
          ).lean<{ viewsCount: number }>();

          viewsCount = updated?.viewsCount ?? viewsCount + 1;
        }
      }
    } catch (viewError) {
      console.error('Recording view failed', viewError);
    }

    // Count likes + check if the current user liked
    const [likeCount, userLiked] = await Promise.all([
      Like.countDocuments({ video: videoId }),
      userId
        ? Like.exists({ video: videoId, userLiked: userId }).then(Boolean)
        : Promise.resolve(false),
    ]);

    videoEntry.likesCount = likeCount;
    videoEntry.viewsCount = viewsCount;

    return NextResponse.json(
      {
        message: 'Successfully fetched',
        data: {
          singleVideo: videoEntry,
          likeCount,
          isLiked: userLiked,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fetching video failed', error);
    return NextResponse.json(
      { error: 'Error while fetching video' },
      { status: 500 },
    );
  }
}