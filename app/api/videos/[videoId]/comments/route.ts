import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Comment from '@/model/Comment.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Create Video's comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    const body = await req.json();

    const data = JSON.parse(body);

    const content = data.content;
    console.log('Wsaiq', content);
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Create raw comment
    const created = await Comment.create({
      commentedBy: session.user.id,
      commentedVideo: videoId,
      content: content.trim(),
    });

    // Re-fetch with aggregation (single document)
    const [comment] = await Comment.aggregate([
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
          repliesCount: { $ifNull: ['$repliesCount', 0] },
        },
      },

      {
        $project: {
          likes: 0,
          commentedBy: 0,
          commentedVideo: 0,
          __v: 0,
        },
      },
    ]);

    return NextResponse.json(
      {
        comment: comment,
        message: 'Comment created',
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Create comment failed', err);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 },
    );
  }
}

// Get All Comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
    }

    const page = Number(req.nextUrl.searchParams.get('page')) || 1;
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id
      ? new mongoose.Types.ObjectId(session.user.id)
      : null;

    const comments = await Comment.aggregate([
      {
        $match: {
          commentedVideo: new mongoose.Types.ObjectId(videoId),
          parentComment: null,
        },
      },

      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: 'users',
          localField: 'commentedBy',
          foreignField: '_id',
          as: 'owner',
          // pipeline: [
          //   {
          //     $project: {
          //       username: 1,
          //       'profilePhoto.url': 1,
          //     },
          //   },
          // ],
        },
      },

      {
        $addFields: {
          owner: { $first: '$owner' },
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

      // Current user liked or not
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
                ],
                as: 'userLike',
              },
            },
            { $limit: 1 },
          ]
        : []),

      {
        $addFields: {
          owner: {
            _id: '$owner._id',
            username: '$owner.username',
            profilePhoto: '$owner.profilePhoto.url',
          },
          likesCount: { $ifNull: [{ $first: '$likes.count' }, 0] },
          isLiked: userId ? { $gt: [{ $size: '$userLike' }, 0] } : false,
        },
      },

      {
        $project: {
          content: 1,
          repliesCount: 1,
          createdAt: 1,
          likesCount: 1,
          isLiked: 1,
          owner: {
            _id: 1,
            username: 1,
            profilePhoto: 1,
          },
        },
      },
    ]);

    console.log(comments);

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
