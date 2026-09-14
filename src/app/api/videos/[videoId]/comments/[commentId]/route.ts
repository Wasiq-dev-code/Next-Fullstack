import { authOptions } from '@/lib/validations/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/database/db';
import Comment from '@/model/Comment.model';
import Like from '@/model/Like.model';
import { Session } from 'next-auth';
import { Comment as CommentsArray } from '@/types/comment';

//  CREATE REPLY
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string; commentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Reply cannot be empty' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const parent = await Comment.findById(commentId);
    if (!parent) {
      return NextResponse.json(
        { error: 'Parent comment not found' },
        { status: 404 },
      );
    }

    const created = await Comment.create({
      commentedBy: session.user.id,
      commentedVideo: parent.commentedVideo,
      parentComment: parent._id,
      content: content.trim(),
    });

    await Comment.findByIdAndUpdate(parent._id, {
      $inc: { repliesCount: 1 },
    });

    const [reply] = await Comment.aggregate([
      { $match: { _id: created._id } },

      {
        $lookup: {
          from: 'users',
          localField: 'commentedBy',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            {
              $project: {
                username: 1,
                profilePhoto: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: { $first: '$owner' },
          likesCount: 0,
        },
      },

      {
        $project: {
          commentedBy: 1,
          content: 1,
          createdAt: 1,
          owner: 1,
          likesCount: 1,
          isLiked: 1,
          repliesCount: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        reply,
        message: 'Reply added successfully',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Reply creation failed', err);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 },
    );
  }
}
//  DELETE COMMENT / REPLY
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string; commentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized Request' },
        { status: 401 },
      );
    }

    const { commentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    await connectToDatabase().catch((err) => {
      throw new Error('Database Connection Errror', err);
    });

    const comment = await Comment.findOne({
      _id: commentId,
      commentedBy: session.user.id,
    });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Reply delete > decrement parent
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    if (comment.parentComment) {
      // Remove likes belonging to a deleted reply as well.
      await Like.deleteMany({ comment: comment._id });
      await Comment.findByIdAndDelete(commentId);
    } else {
      // A parent deletion removes its replies and every like on that tree.
      const replies = await Comment.find({ parentComment: comment._id })
        .select('_id')
        .lean();
      const commentIds = [comment._id, ...replies.map((reply) => reply._id)];

      await Like.deleteMany({ comment: { $in: commentIds } });
      await Comment.deleteMany({ _id: { $in: commentIds } });
    }

    return NextResponse.json(
      {
        isDeleted: true,
        message: 'Comment deleted successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Comment delete operation failed', error);
    return NextResponse.json(
      { error: 'Error while deleting comment' },
      { status: 500 },
    );
  }
}
//  GET REPLIES
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string; commentId: string }> },
) {
  try {
    const { commentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    const page: number = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit: number = Number(req.nextUrl.searchParams.get('limit')) || 5;
    const skip: number = (page - 1) * limit;

    await connectToDatabase().catch((err) => {
      throw new Error('Database Connection Errror', err);
    });

    const session: Session | null = await getServerSession(authOptions);
    const userId: mongoose.Types.ObjectId | null = session?.user?.id
      ? new mongoose.Types.ObjectId(session.user.id)
      : null;

    const comments: CommentsArray[] = await Comment.aggregate([
      {
        $match: {
          parentComment: new mongoose.Types.ObjectId(commentId),
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: 'users',
          localField: 'commentedBy',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            {
              $project: {
                username: 1,
                profilePhoto: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: 'likes',
          let: { commentId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$comment', '$$commentId'] } } },
            { $count: 'count' },
          ],
          as: 'likes',
        },
      },

      ...(userId
        ? [
            {
              $lookup: {
                from: 'likes',
                let: { commentId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$comment', '$$commentId'] },
                          { $eq: ['$userLiked', userId] },
                        ],
                      },
                    },
                  },
                  { $limit: 1 },
                ],
                as: 'userLike',
              },
            },
          ]
        : []),

      // Shape response
      {
        $addFields: {
          owner: { $first: '$owner' },
          likesCount: { $ifNull: [{ $first: '$likes.count' }, 0] },
          isLiked: userId ? { $gt: [{ $size: '$userLike' }, 0] } : false,
        },
      },

      {
        $project: {
          likes: 0,
          userLike: 0,
        },
      },
    ]);

    const hasMore: boolean = comments.length > limit;

    if (hasMore) {
      comments.pop();
    }

    return NextResponse.json({
      page,
      limit,
      hasMore,
      comments,
    });
  } catch (error) {
    console.error('Fetching comments failed', error);
    return NextResponse.json(
      { error: 'Error while fetching comments' },
      { status: 500 },
    );
  }
}
