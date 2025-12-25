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

    const totalLikes = await Like.countDocuments({
      video: videoId,
    });

    if (!totalLikes) {
      return NextResponse.json({
        liked: false,
        message: 'Unsuccessfull to count video likes',
      });
    }

    const deleted = await Like.findOneAndDelete({
      userLiked: userId,
      video: videoId,
    });

    if (deleted) {
      return NextResponse.json({
        liked: false,
        message: 'Video unliked successfully',
        totalVideoLikes: totalLikes,
      });
    }

    const created = await Like.create({ userLiked: userId, video: videoId });

    if (!created) {
      return NextResponse.json({
        liked: false,
        message: 'Unsuccessfull to create video likes',
      });
    }

    return NextResponse.json({
      totalVideoLikes: totalLikes,
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
