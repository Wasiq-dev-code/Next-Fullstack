import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Comment from '@/model/Comment.model';

//  CREATE REPLY
export async function POST(
  req: NextRequest,
  { params }: { params: { videoId: string; commentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = params;

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
          commentedBy: 0,
          commentedVideo: 0,
          parentComment: 0,
          __v: 0,
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
  { params }: { params: { videoId: string; commentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized Request' },
        { status: 401 },
      );
    }

    const { commentId } = params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.commentedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not own this comment' },
        { status: 403 },
      );
    }

    // Reply delete > decrement parent
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    // Parent delete > delete all replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }

    await Comment.findByIdAndDelete(commentId);

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
  { params }: { params: { videoId: string; commentId: string } },
) {
  try {
    const { commentId } = params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid commentId' }, { status: 400 });
    }

    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 5;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const comments = await Comment.aggregate([
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

      {
        $addFields: {
          owner: { $first: '$owner' },
          likesCount: { $ifNull: [{ $first: '$likes.count' }, 0] },
        },
      },

      {
        $project: {
          likes: 0,
        },
      },
    ]);

    return NextResponse.json({
      page,
      limit,
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
