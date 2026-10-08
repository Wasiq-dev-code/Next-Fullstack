// Shared by every /api/analytics/* route: auth, range parsing, DB connect,
// error handling and a short private cache header.
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth'; // swap for your own auth helper
import { authOptions } from '../validations/auth'; // adjust path
import { connectToDatabase } from '../database/db'; // adjust path

const RANGES = { '7d': 7, '28d': 28, '90d': 90 } as const;
const DAY_MS = 86_400_000;

// One key per distinct viewer: user id if logged in, cookie id otherwise
export const VIEWER_KEY = { $ifNull: ['$viewer', '$anonId'] };
export const DAY_EXPR = {
  $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
};

export interface AnalyticsCtx {
  ownerId: mongoose.Types.ObjectId;
  start: Date;
  days: number;
  searchParams: URLSearchParams;
}

/** ['2026-10-01', '2026-10-02', ...] for every day in the range */
export function dayKeys(start: Date, days: number): string[] {
  return Array.from({ length: days }, (_, i) =>
    new Date(start.getTime() + i * DAY_MS).toISOString().slice(0, 10),
  );
}

export async function withAnalytics(
  req: NextRequest,
  handler: (ctx: AnalyticsCtx) => Promise<unknown>,
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const rangeParam = searchParams.get('range') ?? '28d';
    const days = RANGES[rangeParam as keyof typeof RANGES] ?? 28;

    // Start of the UTC day (days - 1) days ago
    const now = new Date();
    const todayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const start = new Date(todayUtc - (days - 1) * DAY_MS);

    await connectToDatabase();

    const data = await handler({
      ownerId: new mongoose.Types.ObjectId(userId),
      start,
      days,
      searchParams,
    });

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, max-age=30' },
    });
  } catch (error) {
    console.error(`Analytics error (${req.nextUrl.pathname}):`, error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}