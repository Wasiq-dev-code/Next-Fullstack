import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Like from '@/model/Like.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = params;
    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Like.findOneAndDelete({
      userLiked: userId,
      comment: commentId,
    });

    if (deleted) {
      // await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: -1 } });

      return NextResponse.json({
        liked: false,
        message: 'Comment unliked successfully',
      });
    }

    await Like.create({ userLiked: userId, comment: commentId });
    // await Comment.updateOne({ _id: commentId }, { $inc: { likesCount: 1 } });

    return NextResponse.json({
      liked: true,
      message: 'Comment liked successfully',
    });
  } catch (error) {
    console.error('Comment like toggle failed', error);
    return NextResponse.json(
      { error: 'Error while toggling like' },
      { status: 500 },
    );
  }
}
