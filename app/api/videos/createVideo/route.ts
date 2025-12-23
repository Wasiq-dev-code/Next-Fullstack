import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/requireAuth';
import { CreateVideoDTO } from '@/lib/types/video';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Create Video
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const body: CreateVideoDTO = await request.json();

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

    const video = await Video.create({
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
        quality: body.transformation?.quality ?? 100,
      },
      randomScore: Math.random(), // server-only
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
