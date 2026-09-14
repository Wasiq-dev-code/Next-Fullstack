export interface CommentOwner {
  username: string;
  profilePhoto: string | { url?: string };
}

export interface Comment {
  _id: string;
  commentedBy?: string;
  content: string;
  owner: CommentOwner;
  likesCount: number;
  isLiked: boolean;
  repliesCount?: number;
  createdAt: string;
}

export interface CommentListResponse {
  page: number;
  limit: number;
  hasMore: boolean;
  comments: Comment[];
}

export type CreateCommentResponse = {
  comment: Comment;
  message: string;
};

export type CreateReplyResponse = {
  reply: Comment;
  message: string;
};
