import { randomUUID } from 'crypto';
import { cookies, headers } from 'next/headers';
import mongoose from 'mongoose';
import User from '@/model/User.model';
import VideoView from '@/model/videoView.model';
import { resolveGeo } from '@/lib/analytics/geo';
import { parseUserAgent } from '@/lib/analytics/userAgent';

const ANON_COOKIE = 'vid_anon';
const DEDUPE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

interface RecordViewInput {
  videoId: string | mongoose.Types.ObjectId;
  ownerId: string | mongoose.Types.ObjectId;
  viewerId?: string | null;
}

/**
 * Records one view event. Call from a route handler (it may set a cookie).
 * Returns { recorded: false } for owner views and repeat views within 30 min.
 */
export async function recordVideoView({
  videoId,
  ownerId,
  viewerId,
}: RecordViewInput): Promise<{ recorded: boolean }> {
  const video = new mongoose.Types.ObjectId(videoId);
  const owner = new mongoose.Types.ObjectId(ownerId);
  const viewer =
    viewerId && mongoose.isValidObjectId(viewerId)
      ? new mongoose.Types.ObjectId(viewerId)
      : null;

  // Don't count the owner's own views
  if (viewer && viewer.equals(owner)) return { recorded: false };

  // Anonymous id for logged-out viewers
  const cookieStore = await cookies();
  let anonId: string | null = null;
  if (!viewer) {
    anonId = cookieStore.get(ANON_COOKIE)?.value ?? null;
    if (!anonId) {
      anonId = randomUUID();
      cookieStore.set(ANON_COOKIE, anonId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  // De-duplicate refreshes
  const alreadyViewed = await VideoView.exists({
    video,
    createdAt: { $gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
    ...(viewer ? { viewer } : { anonId }),
  });
  if (alreadyViewed) return { recorded: false };

  // Geo + device
  const h = await headers();
  let geo = resolveGeo(h);
  if (!geo.country && viewer) {
    const user = await User.findById(viewer)
      .select('location')
      .lean<{ location?: { country?: string; region?: string; city?: string } }>();
    geo = resolveGeo(h, user?.location);
  }
  const { device, browser, os } = parseUserAgent(h.get('user-agent'));

  await VideoView.create({
    video,
    owner,
    viewer,
    anonId,
    ...geo,
    device,
    browser,
    os,
  });

  return { recorded: true };
}