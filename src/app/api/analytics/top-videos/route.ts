// GET /api/analytics/top-videos?range=28d
import { NextRequest } from 'next/server';
import Video from '@/model/Video.model';
import VideoView from '@/model/videoView.model';
import { withAnalytics } from '@/lib/analytics/analyticsRoute';

export const GET = (req: NextRequest) =>
  withAnalytics(req, async ({ ownerId, start }) =>
    VideoView.aggregate([
      { $match: { owner: ownerId, createdAt: { $gte: start } } },
      { $group: { _id: '$video', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: Video.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'video',
        },
      },
      { $unwind: '$video' },
      {
        $project: {
          _id: 0,
          videoId: { $toString: '$_id' },
          title: '$video.title',
          thumbnail: '$video.thumbnail.url',
          views: 1,
        },
      },
    ]),
  );