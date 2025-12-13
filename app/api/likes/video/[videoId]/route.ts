import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Like from '@/model/Like.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = params;
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Like.findOneAndDelete({
      userLiked: userId,
      video: videoId,
    });

    if (deleted) {
      // await Video.updateOne({ _id: videoId }, { $inc: { likesCount: -1 } });

      return NextResponse.json({
        liked: false,
        message: 'Video unliked successfully',
      });
    }

    await Like.create({ userLiked: userId, video: videoId });
    // await Video.updateOne({ _id: videoId }, { $inc: { likesCount: 1 } });

    return NextResponse.json({
      liked: true,
      message: 'Video liked successfully',
    });
  } catch (error) {
    console.error('Video like toggle failed', error);
    return NextResponse.json(
      { error: 'Error while toggling like' },
      { status: 500 },
    );
  }
}
