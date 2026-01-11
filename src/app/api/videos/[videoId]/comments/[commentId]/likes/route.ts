import { authOptions } from '@/src/lib/auth';
import { connectToDatabase } from '@/src/lib/db';
import Like from '@/src/model/Like.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string; commentId: string }> },
) {
  try {
    const { commentId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    await connectToDatabase();

    // Toggle like
    const deleted = await Like.findOneAndDelete({
      userLiked: userId,
      comment: commentId,
    });

    if (!deleted) {
      await Like.create({
        userLiked: userId,
        comment: commentId,
      });
    }

    // Count AFTER toggle
    const totalCommentLikes = await Like.countDocuments({
      comment: commentId,
    });

    return NextResponse.json({
      liked: !deleted,
      totalCommentLikes,
      message: deleted
        ? 'Comment unliked successfully'
        : 'Comment liked successfully',
    });
  } catch (error) {
    console.error('Comment like toggle failed', error);
    return NextResponse.json(
      { error: 'Error while toggling like' },
      { status: 500 },
    );
  }
}
