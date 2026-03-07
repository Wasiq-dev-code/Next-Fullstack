import { NextResponse } from 'next/server';
import { Result } from '@/types/result';
import { Video } from '@prisma/client';
import prisma from '../database/prisma';
import { isCuid } from '@paralleldrive/cuid2';

export async function requireVideoOwner(
  videoId: string,
  userId: string,
): Promise<Result<Video>> {
  if (!isCuid(videoId)) {
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

  const video = await prisma.video.findFirst({
    where: {
      id: videoId,
      ownerId: userId,
    },
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
