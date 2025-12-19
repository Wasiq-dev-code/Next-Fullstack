import { IVideo } from '@/model/Video.model';
import mongoose, { HydratedDocument } from 'mongoose';
export interface VideoQuery {
  owner: mongoose.Types.ObjectId;
  createdAt?: {
    $lt: Date;
  };
}

export type VideoFeed = {
  _id: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  owner: {
    username: string;
    profilePhoto: string;
  };
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: Response };

export type VideoAuthData = {
  userId: string;
  video: HydratedDocument<IVideo>;
};

export type VideoFormData = Omit<IVideo, '_id'>;

export type FeedResponse = {
  videos: VideoFeed[];
  nextCursor: number | null;
};

export type FeedRequest = {
  cursor: number | null;
  excludeIds: string[];
};

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export type RegisterData = {
  email: string;
  password: string;
};
