export interface CommentOwner {
  username: string;
  profilePhoto: string;
}

export interface Comment {
  _id: string;
  content: string;
  owner: CommentOwner;
  likesCount: number;
  repliesCount?: number;
  createdAt: string;
}

export interface CommentListResponse {
  page: number;
  limit: number;
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
