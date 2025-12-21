export type ToggleLikeResponse = {
  liked: boolean;
  message: string;
};

export type LikeVideoResponse = ToggleLikeResponse & {
  totalVideoLikes: number;
};

export type LikeCommentResponse = ToggleLikeResponse & {
  totalCommentLikes: number;
};
