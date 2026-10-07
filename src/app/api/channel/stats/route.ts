// app/api/videos/stats/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth'; // swap for your own auth helper
import { authOptions } from '@/lib/validations/auth'; // adjust path
import { connectToDatabase } from '@/lib/database/db'; // adjust path
import Video from '@/model/Video.model';
import Follow from '@/model/Follow.model';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // aggregate() does not auto-cast strings, so convert explicitly
    const ownerId = new mongoose.Types.ObjectId(userId);

    const [videoStats, followersCount] = await Promise.all([
      Video.aggregate([
        { $match: { owner: ownerId } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$viewsCount' },
            totalVideos: { $sum: 1 },
          },
        },
      ]),
      Follow.countDocuments({ account: ownerId }),
    ]);

    const { totalViews = 0, totalVideos = 0 } = videoStats[0] ?? {};

    return NextResponse.json(
      {
        totalViews,
        totalVideos,
        followersCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Channel stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel stats' },
      { status: 500 },
    );
  }
}