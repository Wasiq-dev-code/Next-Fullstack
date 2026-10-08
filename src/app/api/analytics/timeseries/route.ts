// GET /api/analytics/timeseries?range=28d  (feeds the chart AND the table)
import { NextRequest } from 'next/server';
import VideoView from '@/model/videoView.model';
import Follow from '@/model/Follow.model';
import {
  DAY_EXPR,
  VIEWER_KEY,
  dayKeys,
  withAnalytics,
} from '@/lib/analytics/analyticsRoute';

const IS_LOGGED_OUT = { $eq: [{ $ifNull: ['$viewer', null] }, null] };

export const GET = (req: NextRequest) =>
  withAnalytics(req, async ({ ownerId, start, days }) => {
    const [viewRows, followRows] = await Promise.all([
      VideoView.aggregate([
        { $match: { owner: ownerId, createdAt: { $gte: start } } },
        {
          $group: {
            _id: { day: DAY_EXPR, viewer: VIEWER_KEY },
            views: { $sum: 1 },
            watchSeconds: { $sum: '$watchSeconds' },
            loggedOut: { $max: { $cond: [IS_LOGGED_OUT, 1, 0] } },
          },
        },
        {
          $group: {
            _id: '$_id.day',
            views: { $sum: '$views' },
            watchSeconds: { $sum: '$watchSeconds' },
            uniqueViewers: { $sum: 1 },
            loggedOutViewers: { $sum: '$loggedOut' },
          },
        },
      ]),
      Follow.aggregate([
        { $match: { account: ownerId, createdAt: { $gte: start } } },
        { $group: { _id: DAY_EXPR, count: { $sum: 1 } } },
      ]),
    ]);

    const byDay = new Map<string, any>(viewRows.map((r: any) => [r._id, r]));
    const follows = new Map<string, number>(
      followRows.map((r: any) => [r._id, r.count]),
    );

    // every day present, even with zero activity
    return {
      daily: dayKeys(start, days).map((date) => {
        const v = byDay.get(date);
        return {
          date,
          views: v?.views ?? 0,
          uniqueViewers: v?.uniqueViewers ?? 0,
          loggedOutViewers: v?.loggedOutViewers ?? 0,
          watchSeconds: v?.watchSeconds ?? 0,
          newFollowers: follows.get(date) ?? 0,
        };
      }),
    };
  });