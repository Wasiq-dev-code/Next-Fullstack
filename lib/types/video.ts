export type BaseFeed = {
  _id: string;
  title: string;
  thumbnail: {
    url: string;
  };
  owner: {
    username: string;
    profilePhoto: string;
  };
};

export type VideoFeed = BaseFeed & {
  createdAt: string;
};

export type VideoDetails = BaseFeed & {
  video: {
    url: string;
  };
  description: string;
  likes: number;
  uploadedAt: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
};

export type SingleVideoRes = {
  message: string;
  video: VideoDetails;
};

export type FeedResponse = {
  videos: VideoFeed[];
  nextCursor: number | null;
};

export type FeedRequest = {
  cursor: number | null;
  excludeIds: string[];
};
