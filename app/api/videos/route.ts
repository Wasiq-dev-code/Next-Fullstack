import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Video, { IVideo } from '@/model/Video.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find({}).sort({ createdAt: -1 }).lean();

    if (!videos || videos.length === 0) {
      return NextResponse.json([], { status: 201 });
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error while getting videos:', error);
    return NextResponse.json(
      {
        error: 'Fetching videos failed',
      },
      { status: 500 },
    );
  }
}
