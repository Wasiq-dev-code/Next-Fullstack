// app/api/videos/[id]/watch/route.ts
// Receives watch-time heartbeats from the player and adds them to the
// viewer's most recent view event for this video.
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth'; // swap for your own auth helper
import { authOptions } from '@/lib/validations/auth'; // adjust path
import { connectToDatabase } from '@/lib/database/db'; // adjust path
import VideoView from '@/model/videoView.model';

const MAX_SECONDS_PER_REQUEST = 60; // guards against inflated numbers
const ATTRIBUTION_WINDOW_MS = 6 * 60 * 60 * 1000; // view must be < 6h old

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next 14: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid video id' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const seconds = Math.round(Number(body?.seconds));
    if (!Number.isFinite(seconds) || seconds < 1) {
      return NextResponse.json({ error: 'Invalid seconds' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const anonId = (await cookies()).get('vid_anon')?.value;

    // Same identity used by recordVideoView
    const who =
      userId && mongoose.isValidObjectId(userId)
        ? { viewer: new mongoose.Types.ObjectId(userId) }
        : anonId
          ? { anonId }
          : null;

    // Nothing to attribute to (e.g. the owner watching their own video)
    if (!who) return NextResponse.json({ ok: true });

    await connectToDatabase();

    await VideoView.findOneAndUpdate(
      {
        video: new mongoose.Types.ObjectId(id),
        ...who,
        createdAt: { $gte: new Date(Date.now() - ATTRIBUTION_WINDOW_MS) },
      },
      { $inc: { watchSeconds: Math.min(seconds, MAX_SECONDS_PER_REQUEST) } },
      { sort: { createdAt: -1 } },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Watch heartbeat error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}