import { authOptions } from '@/src/lib/auth';
import { connectToDatabase } from '@/src/lib/db';
import Like from '@/src/model/Like.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Like.findOneAndDelete({
      userLiked: userId,
      video: videoId,
    });

    if (!deleted) {
      await Like.create({ userLiked: userId, video: videoId });
    }

    const totalVideoLikes = await Like.countDocuments({ video: videoId });

    return NextResponse.json({
      liked: !deleted,
      totalVideoLikes,
      message: deleted
        ? 'Video unliked successfully'
        : 'Video liked successfully',
    });
  } catch (error) {
    console.error('Video like toggle failed', error);
    return NextResponse.json(
      { error: 'Error while toggling like' },
      { status: 500 },
    );
  }
}
