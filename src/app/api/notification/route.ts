import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/database/db';
import { requireAuth } from '@/lib/validations/requireAuth';
import Notification from '@/model/Notification.model';

const markReadSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string()).min(1).max(100) }),
]);

// Inbox: GET /api/notifications?limit=20&cursor=<lastId>&unread=true
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const cursor = searchParams.get('cursor');
    const unreadOnly = searchParams.get('unread') === 'true';

    if (cursor && !mongoose.isValidObjectId(cursor)) {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }

    const recipient = new mongoose.Types.ObjectId(auth.data);

    const filter: Record<string, unknown> = { recipient };
    if (unreadOnly) filter.isRead = false;
    if (cursor) filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };

    const [items, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1) // one extra to know if there is a next page
        .populate('sender', 'username profilePhoto.url')
        .lean(),
      Notification.countDocuments({ recipient, isRead: false }),
    ]);

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;

    return NextResponse.json({
      notifications: page,
      unreadCount,
      nextCursor: hasMore ? page[page.length - 1]._id : null,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}

// Mark as read: body is { all: true } or { ids: ["..."] }
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const parsed = markReadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation Failed', issue: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const recipient = new mongoose.Types.ObjectId(auth.data);
    const filter: Record<string, unknown> = { recipient, isRead: false };

    if ('ids' in parsed.data) {
      const ids = parsed.data.ids.filter((id) => mongoose.isValidObjectId(id));
      filter._id = { $in: ids };
    }

    const result = await Notification.updateMany(filter, {
      $set: { isRead: true },
    });

    return NextResponse.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 },
    );
  }
}