import { IVideo } from '@/model/Video.model';
import mongoose, { HydratedDocument } from 'mongoose';

export interface VideoQuery {
  owner: mongoose.Types.ObjectId;
  createdAt?: {
    $lt: Date;
  };
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: Response };

export type VideoAuthData = {
  userId: string;
  video: HydratedDocument<IVideo>;
};

export type VideoFormData = Omit<IVideo, '_id'>;

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

export type RegisterData = {
  email: string;
  password: string;
};
