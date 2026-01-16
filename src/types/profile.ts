import { VideoFeed } from './video';

export type Profile = {
  _id: string;
  username: string;
  profilePhoto: string;
  followersCount: number;
  followToCount: number;
  postsCount: number;
  isFollowed: boolean;
  isMe: boolean;
};

export type ProfileResponse = {
  profile: Profile;
};

export type ProfileVideoResponse = VideoFeed & {
  videos: VideoFeed[];
  nextCursor: number | null;
};

export type ProfilePrivateResponse = {
  message: string;
  isPrivate: boolean;
};

export type Message = {
  message: string;
};

export type ChangeFields = {
  email: string;
  username: string;
  profilePhoto: {
    url: string;
    fileId: string;
  };
};

export type ChangeFieldsResponse = {
  user: ChangeFields;
  message: string;
};

export type PayloadChangeFields = {
  email?: string;
  username?: string;
  profilePhoto?: {
    url: string;
    fileId: string;
  };
};

export type isPrivateResponse = {
  message: string;
  isPrivate: boolean;
};
