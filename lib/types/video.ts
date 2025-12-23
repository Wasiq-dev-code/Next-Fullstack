export type BaseFeed = {
  _id: string;
  title: string;
  thumbnail: {
    url: string;
  };
  likesCount: number;
  owner: {
    _id: string;
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
  uploadedAt: string;
  controls?: boolean;
  transformation?: {
    height: number;
    width: number;
    quality?: number;
  };
};

export type VideoData = {
  singleVideo: VideoDetails;
  likeCount: number;
  isLiked: boolean;
};

export type SingleVideoRes = {
  message: string;
  data: VideoData;
};

export type FeedResponse = {
  videos: VideoFeed[];
  nextCursor: number | null;
};

export type FeedRequest = {
  cursor: number | null;
  excludeIds: string[];
};

export interface CreateVideoDTO {
  title: string;
  description: string;
  thumbnail: {
    url: string;
    fileId: string;
  };
  video: {
    url: string;
    fileId: string;
  };
  controls?: boolean;
  transformation?: {
    quality?: number;
  };
}

export type CreateVideoResponse = {
  message: string;
  videoId: string;
};
