import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Comment from '@/model/Comment.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Create Video's comment
export async function POST(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized Request',
        },
        { status: 401 },
      );
    }
    const { videoId } = params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const comment = await Comment.create({
      commentedBy: session.user.id,
      commentedVideo: videoId,
      content: content.trim(),
    });

    return NextResponse.json(
      {
        comment,
        message: 'Comment Successfully Created',
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error('VideoComment operation failed', error);
    return NextResponse.json(
      { error: 'Error while creating videoComment' },
      { status: 500 },
    );
  }
}

// Get All Comments and their replies Of Video
export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    const { videoId } = params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const comments = await Comment.aggregate([
      {
        $match: {
          commentedVideo: new mongoose.Types.ObjectId(videoId),
          parentComment: null,
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
