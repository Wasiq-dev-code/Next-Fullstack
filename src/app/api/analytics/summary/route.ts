// GET /api/analytics/summary?range=28d
import { NextRequest } from 'next/server';
import VideoView from '@/model/videoView.model';
import Follow from '@/model/Follow.model';
import { VIEWER_KEY, withAnalytics } from '@/lib/analytics/analyticsRoute';

export const GET = (req: NextRequest) =>
  withAnalytics(req, async ({ ownerId, start }) => {
    const [agg, newFollowers] = await Promise.all([
      VideoView.aggregate([
        { $match: { owner: ownerId, createdAt: { $gte: start } } },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  views: { $sum: 1 },
                  watchSeconds: { $sum: '$watchSeconds' },
                },
              },
            ],
            unique: [{ $group: { _id: VIEWER_KEY } }, { $count: 'n' }],
            loggedOut: [
              { $match: { viewer: null } },
              { $group: { _id: '$anonId' } },
              { $count: 'n' },
            ],
          },
        },
      ]),
      Follow.countDocuments({ account: ownerId, createdAt: { $gte: start } }),
    ]);

    const f = agg[0];
    return {
      totalViews: f.totals[0]?.views ?? 0,
      uniqueViewers: f.unique[0]?.n ?? 0,
      loggedOutViewers: f.loggedOut[0]?.n ?? 0,
      watchSeconds: f.totals[0]?.watchSeconds ?? 0,
      newFollowers,
    };
  });