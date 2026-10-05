import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/database/db';
import { requireAuth } from '@/lib/validations/requireAuth';
import Follow from '@/model/Follow.model';

type Ctx = { params: Promise<{ accountId: string }> };

const levelSchema = z.object({
  notificationLevel: z.enum(['ALL', 'NONE']),
});

// The bell: PATCH /api/follow/:accountId/notifications  { notificationLevel }
export async function PATCH(request: NextRequest, { params }: Ctx) {
  try {
    await connectToDatabase();

    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const { accountId } = await params;
    if (!mongoose.isValidObjectId(accountId)) {
      return NextResponse.json({ error: 'Invalid account id' }, { status: 400 });
    }

    const parsed = levelSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation Failed',
          issue: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await Follow.findOneAndUpdate(
      { follower: auth.data, account: accountId },
      { notificationLevel: parsed.data.notificationLevel },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'You are not following this account' },
        { status: 404 },
      );
    }

    return NextResponse.json({ notificationLevel: updated.notificationLevel });
  } catch (error) {
    console.error('Update bell error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification setting' },
      { status: 500 },
    );
  }
}