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

    const totalLikes = await Like.countDocuments({
      comment: commentId,
    });

    if (!totalLikes) {
      return NextResponse.json({
        liked: false,
        message: 'Unsuccessfull to count comment likes',
      });
    }

    const deleted = await Like.findOneAndDelete({
      userLiked: userId,
      comment: commentId,
    });

    if (deleted) {
      return NextResponse.json({
        totalCommentLikes: totalLikes,
        liked: false,
        message: 'Comment unliked successfully',
      });
    }

    const created = await Like.create({
      userLiked: userId,
      comment: commentId,
    });

    if (!created) {
      return NextResponse.json({
        liked: false,
        message: 'Unsuccessfull to create Like on Comment',
      });
    }

    return NextResponse.json({
      totalCommentLikes: totalLikes,
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
