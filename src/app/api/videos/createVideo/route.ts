import { connectToDatabase } from '@/src/lib/db';
import { requireAuth } from '@/src/lib/requireAuth';
import Video from '@/src/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import {
  RegisterVideoDTO,
  registerVideoSchema,
} from '@/src/lib/validators/registerVideo';

// Create Video
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const body = await request.json();

    const finalBody: RegisterVideoDTO = JSON.parse(body);

    const parsed = registerVideoSchema.safeParse(finalBody);

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
