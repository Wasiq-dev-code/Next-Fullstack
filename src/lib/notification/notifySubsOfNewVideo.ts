import mongoose from 'mongoose';
import Follow from '@/model/Follow.model';
import Notification from '@/model/Notification.model';

const BATCH_SIZE = 1000;

interface NewVideoPayload {
  videoId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  thumbnailUrl?: string;
  isPrivate?: boolean;
}

export async function notifySubscribersOfNewVideo({
  videoId,
  ownerId,
  title,
  thumbnailUrl,
  isPrivate,
}: NewVideoPayload): Promise<number> {
  // Never notify for private videos
  if (isPrivate) return 0;

  const cursor = Follow.find({
    account: ownerId,
    notificationLevel: { $ne: 'NONE' },
  })
    .select('follower')
    .lean()
    .cursor();

  let batch: Parameters<typeof Notification.bulkWrite>[0] = [];
  let total = 0;

  const flush = async () => {
    if (!batch.length) return;

    await Notification.bulkWrite(batch, { ordered: false });

    total += batch.length;
    batch = [];
  };

  for await (const f of cursor) {
    const doc = {
      recipient: f.follower,
      sender: ownerId,
      type: 'NEW_VIDEO',
      video: videoId,
      title,
      thumbnailUrl,
      isRead: false,
    };

    batch.push({
      updateOne: {
        filter: {
          recipient: f.follower,
          video: videoId,
          type: 'NEW_VIDEO',
        },
        update: {
          $setOnInsert: doc,
        },
        upsert: true,
      },
    });

    if (batch.length >= BATCH_SIZE) {
      await flush();
    }
  }

  await flush();

  return total;
}