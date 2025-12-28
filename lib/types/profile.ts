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
  nextCursor: string | null;
};
