// GET /api/analytics/cities?range=28d
import { NextRequest } from 'next/server';
import VideoView from '@/model/videoView.model';
import { withAnalytics } from '@/lib/analytics/analyticsRoute';

export const GET = (req: NextRequest) =>
  withAnalytics(req, async ({ ownerId, start }) => {
    const rows = await VideoView.aggregate([
      { $match: { owner: ownerId, createdAt: { $gte: start } } },
      {
        $group: {
          _id: { city: '$city', country: '$country' },
          views: { $sum: 1 },
          watchSeconds: { $sum: '$watchSeconds' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    return rows.map((r: any) => ({
      city: r._id.city ?? '',
      country: r._id.country ?? '',
      views: r.views,
      watchSeconds: r.watchSeconds,
    }));
  });