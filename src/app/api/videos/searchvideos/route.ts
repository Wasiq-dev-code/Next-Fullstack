import { connectToDatabase } from '@/lib/database/db';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';
import type { PipelineStage } from 'mongoose';

const LIMIT = 10 as const;
const SEARCH_SCORE_THRESHOLD = 1.0; // tune based on real score values from your data

// Scales fuzzy tolerance to query length so short/garbage queries
// don't loosely match unrelated words. Atlas Search only accepts
// maxEdits of 1 or 2 (0 is invalid), so short terms skip fuzzy
// entirely and rely on exact/substring-style text matching instead.
function getFuzzyOptions(
  term: string,
): { maxEdits: 1 | 2; prefixLength: number } | undefined {
  if (term.length <= 3) return undefined; // no fuzziness for very short terms
  if (term.length <= 5) return { maxEdits: 1, prefixLength: 2 };
  return { maxEdits: 2, prefixLength: 2 };
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { query, cursor } = body;

    if (typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query must be a string' },
        { status: 400 },
      );
    }

    const searchQuery = query.trim();

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query cannot be empty' },
        { status: 400 },
      );
    }

    let cursorDate: Date | undefined;
    if (cursor) {
      cursorDate = new Date(cursor);
      if (Number.isNaN(cursorDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid cursor' },
          { status: 400 },
        );
      }
    }

    const fuzzy = getFuzzyOptions(searchQuery);

    const searchStage = {
      $search: {
        index: 'Video-Platform', // must match the index name in Atlas exactly
        compound: {
          should: [
            {
              text: {
                query: searchQuery,
                path: 'title',
                ...(fuzzy && { fuzzy }),
                score: { boost: { value: 3 } },
              },
            },
            {
              text: {
                query: searchQuery,
                path: 'description',
                ...(fuzzy && { fuzzy }),
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    } as PipelineStage;

    const pipeline: PipelineStage[] = [searchStage];

    // Attach the Atlas Search relevance score, then drop anything too weak
    // to be a real match. This is what filters out nonsense queries that
    // technically clear minimumShouldMatch but aren't meaningful hits.
    pipeline.push(
      { $addFields: { searchScore: { $meta: 'searchScore' } } },
      { $match: { searchScore: { $gte: SEARCH_SCORE_THRESHOLD } } },
    );

    if (cursorDate) {
      pipeline.push({ $match: { createdAt: { $lt: cursorDate } } });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $limit: LIMIT },

      // owner info
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },

      // likes count
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'video',
          as: 'likes',
        },
      },
      { $addFields: { likesCount: { $size: '$likes' } } },

      // final shape
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          'thumbnail.url': 1,
          createdAt: 1,
          likesCount: 1,
          viewsCount: 1,
          owner: {
            _id: '$owner._id',
            username: '$owner.username',
            profilePhoto: '$owner.profilePhoto',
          },
          // searchScore intentionally left out of the response;
          // remove this comment and add `searchScore: 1` above if you
          // want to inspect real values while tuning the threshold
        },
      },
    );

    const videos = await Video.aggregate(pipeline);

    if (videos.length === 0) {
      return NextResponse.json({
        videos: [],
        query: searchQuery,
        nextCursor: null,
      });
    }

    const nextCursor =
      videos.length === LIMIT
        ? videos[videos.length - 1].createdAt.toISOString()
        : null;

    return NextResponse.json({
      videos,
      query: searchQuery,
      nextCursor,
    });
  } catch (error) {
    console.error('Search videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search videos' },
      { status: 500 },
    );
  }
}