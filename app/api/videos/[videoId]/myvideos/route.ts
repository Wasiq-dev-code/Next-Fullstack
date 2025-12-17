import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import { withVideoAuth } from '@/lib/withVideoAuth';
import Video, { IVideo } from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { deleteFileFromImageKit } from '@/lib/imageKitDelete';
import { VideoQuery } from '@/lib/types/result';

// Create Video
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();

    if (!auth.ok) return auth.error;

    const body: IVideo = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.thumbnail?.url ||
      !body.thumbnail?.fileId ||
      !body.video?.url ||
      !body.video?.fileId
    ) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 },
      );
    }

    const videoData = {
      title: body.title,
      description: body.description,
      thumbnail: {
        url: body.thumbnail.url,
        fileId: body.thumbnail.fileId,
      },
      video: {
        url: body.video.url,
        fileId: body.video.fileId,
      },
      controls: body.controls ?? true,
      owner: new mongoose.Types.ObjectId(auth.data),
      transformation: {
        height: 1920,
        width: 1080,
        quality: body.transformation?.quality ?? 100,
      },
    };
    const newVideo = await Video.create(videoData);

    return NextResponse.json(
      {
        message: 'Successfully created a video',
        newVideo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Video',
      },
      { status: 500 },
    );
  }
}

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
    const { title, description, thumbnail } = body;

    const video = guard.data.video;

    if (title) video.title = title;
    if (description) video.description = description;

    if (
      thumbnail &&
      thumbnail.fileId &&
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

// myvideos
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const userId = auth.data;

    const { searchParams } = req.nextUrl;
    const cursor = searchParams.get('cursor');

    if (cursor && isNaN(Date.parse(cursor))) {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }

    const LIMIT: number = 10;

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
    console.error('Get my videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 },
    );
  }
}
