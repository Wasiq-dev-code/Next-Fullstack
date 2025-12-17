import mongoose, { HydratedDocument } from 'mongoose';
import Video, { IVideo } from '@/model/Video.model';
import { NextResponse } from 'next/server';
import { Result } from './types/result';

export async function requireVideoOwner(
  videoId: string,
  userId: string,
): Promise<Result<HydratedDocument<IVideo>>> {
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          message: 'Invalid video ID',
        },
        { status: 400 },
      ),
    };
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: userId,
  });

  if (!video) {
    return {
      ok: false,
      error: NextResponse.json(
        { message: 'Video not found or access denied' },
        { status: 403 },
      ),
    };
  }

  return { ok: true, data: video };
}
