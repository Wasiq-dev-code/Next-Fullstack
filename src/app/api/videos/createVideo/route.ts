import { connectToDatabase } from '@/lib/database/db';
import { requireAuth } from '@/lib/validations/requireAuth';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { registerVideoSchema } from '@/validators/registerVideo';
import { notifySubscribersOfNewVideo } from '@/lib/notification/notifySubsOfNewVideo';

// Create Video
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const body = await request.json();
    const parsed = registerVideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation Failed',
          issue: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const video = await Video.create({
      title: parsed.data.title,
      description: parsed.data.description,
      thumbnail: {
        url: parsed.data.thumbnail.url,
        fileId: parsed.data.thumbnail.fileId,
      },
      video: {
        url: parsed.data.video.url,
        fileId: parsed.data.video.fileId,
      },

      // backend decides
      controls: true,

      owner: new mongoose.Types.ObjectId(auth.data),

      transformation: {
        quality: 80,
      },

      randomScore: Math.random(), // For random feeds
    });

    after(async () => {
  try {
    await notifySubscribersOfNewVideo({
      videoId: video._id,
      ownerId: video.owner,
      title: video.title,
      thumbnailUrl: video.thumbnail.url,
      isPrivate: video.isPrivate,
    });
  } catch (err) {
    console.error('Notify subscribers failed:', err);
  }
});

    return NextResponse.json(
      {
        message: 'Video created successfully',
        videoId: video._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 },
    );
  }
}
function after(task: () => Promise<void> | void) {
  setTimeout(() => {
    void (async () => {
      try {
        await task();
      } catch (error) {
        console.error('Deferred task failed:', error);
      }
    })();
  }, 0);
}

