import mongoose, { model, models, Schema } from 'mongoose';

export const VIDEO_DIMENSIONS = {
  width: 1440,
  height: 900,
} as const;

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  video: {
    url: string;
    fileId: string;
  };
  thumbnail: {
    url: string;
    fileId: string;
  };
  isPrivate?: boolean;
  controls?: boolean;
  owner: mongoose.Types.ObjectId;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
  randomScore: number;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      fileId: {
        type: String,
        select: false,
        required: true,
      },
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    video: {
      url: {
        type: String,
        required: true,
      },
      fileId: {
        type: String,
        select: false,
        required: true,
      },
    },
    controls: { type: Boolean, default: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.height },
      width: { type: Number, default: VIDEO_DIMENSIONS.width },
      quality: { type: Number, min: 1, max: 100 },
    },
    randomScore: {
      type: Number,
      select: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Specifically for Infinite scrolling
videoSchema.index({ owner: 1, createdAt: -1 });

const Video = models?.Video || model<IVideo>('Video', videoSchema);

export default Video;
