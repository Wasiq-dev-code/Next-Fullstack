import mongoose, { model, models, Schema } from 'mongoose';

export type NotificationType = 'NEW_VIDEO';

export interface INotification {
  _id?: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId; // the channel that uploaded
  type: NotificationType;
  video?: mongoose.Types.ObjectId;
  // Snapshot so the inbox renders without joining Video
  title: string;
  thumbnailUrl?: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['NEW_VIDEO'],
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    title: { type: String, required: true },
    thumbnailUrl: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Inbox listing (cursor pagination on _id, newest first)
notificationSchema.index({ recipient: 1, _id: -1 });

// Unread badge count
notificationSchema.index({ recipient: 1, isRead: 1 });

// Idempotency: the same video never notifies the same user twice
notificationSchema.index(
  { recipient: 1, video: 1, type: 1 },
  { unique: true, partialFilterExpression: { video: { $exists: true } } },
);

// Auto-delete after 90 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
);

const Notification =
  models.Notification ||
  model<INotification>('Notification', notificationSchema);

export default Notification;