import { connectToDatabase } from '@/lib/db';
import { withVideoAuth } from '@/lib/withVideoAuth';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { deleteFileFromImageKit } from '@/lib/imageKitOps';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Like from '@/model/Like.model';
import { changeVideoFields } from '@/lib/validators/changeVideoFields';

// Update video
export async function PATCH(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    await connectToDatabase();

    const guard = await withVideoAuth(params.videoId);
    if (!guard.ok) return guard.error;

    const body = await req.json();

    const parsed = changeVideoFields.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Error while validation',
          issue: parsed.error.flatten().fieldErrors,
        },
        {
          status: 409,
        },
      );
    }

    const { title, description, thumbnail } = parsed.data;

    const video = guard.data.video;

    if (title) video.title = title;
    if (description) video.description = description;

    if (
      thumbnail &&
      thumbnail.fileId &&
      video.thumbnail &&
      thumbnail.fileId !== video.thumbnail.fileId
    ) {
      const deleted = await deleteFileFromImageKit(video.thumbnail.fileId);

      if (!deleted) {
        console.warn('Thumbnail cleanup failed');
      }

      video.thumbnail = thumbnail;
    }

    await video.save();

    return NextResponse.json(
      { message: 'Video updated successfully', video },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 },
    );
  }
}

// Delete video
export async function DELETE(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    await connectToDatabase();

    const guard = await withVideoAuth(params.videoId);
    if (!guard.ok) return guard.error;

    const video = guard.data.video;

    if (video.thumbnail?.fileId) {
      await deleteFileFromImageKit(video.thumbnail.fileId);
    }

    if (video.video?.fileId) {
      await deleteFileFromImageKit(video.video.fileId);
    }

    await Video.deleteOne({ _id: video._id });

    return NextResponse.json(
      { message: 'Video deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('DELETE VIDEO ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 },
    );
  }
}

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

    // Check if user liked
    const userLiked = userId
      ? Boolean(await Like.exists({ video: videoId, userLiked: userId }))
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
