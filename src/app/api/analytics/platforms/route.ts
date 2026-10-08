// GET /api/analytics/platforms?range=28d&by=device|browser
import { NextRequest } from 'next/server';
import VideoView from '@/model/videoView.model';
import { withAnalytics } from '@/lib/analytics/analyticsRoute';

export const GET = (req: NextRequest) =>
  withAnalytics(req, async ({ ownerId, start, searchParams }) => {
    const field = searchParams.get('by') === 'browser' ? 'browser' : 'device';

    const rows = await VideoView.aggregate([
      { $match: { owner: ownerId, createdAt: { $gte: start } } },
      { $group: { _id: `$${field}`, views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    return rows.map((r: any) => ({ name: r._id, views: r.views }));
  });