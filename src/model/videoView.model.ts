import mongoose, { model, models, Schema } from 'mongoose';

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface IVideoView {
  _id?: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId; // denormalized: analytics queries skip a join
  viewer?: mongoose.Types.ObjectId | null; // null = logged out
  anonId?: string | null; // cookie id for counting logged-out viewers
  country: string;
  region: string;
  city: string;
  device: DeviceType;
  browser: string;
  os: string;
  watchSeconds: number;
  createdAt?: Date;
}

const videoViewSchema = new Schema<IVideoView>(
  {
    video: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    viewer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    anonId: { type: String, default: null },
    country: { type: String, default: '', uppercase: true, trim: true },
    region: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop',
    },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    watchSeconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Analytics dashboard queries
videoViewSchema.index({ owner: 1, createdAt: -1 });
// Per-video queries
videoViewSchema.index({ video: 1, createdAt: -1 });
// De-duplication lookups
videoViewSchema.index({ video: 1, viewer: 1, createdAt: -1 });
videoViewSchema.index({ video: 1, anonId: 1, createdAt: -1 });

const VideoView =
  models?.VideoView || model<IVideoView>('VideoView', videoViewSchema);

export default VideoView;