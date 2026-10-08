import mongoose, { model, models, Schema } from 'mongoose';

export const COMMENT_STATUS = ['published', 'held', 'spam', 'removed'] as const;
export type CommentStatus = (typeof COMMENT_STATUS)[number];

export interface IComment {
  _id?: mongoose.Types.ObjectId;

  // Relations
  commentedBy: mongoose.Types.ObjectId;
  commentedVideo: mongoose.Types.ObjectId;
  videoOwner: mongoose.Types.ObjectId; // denormalized: owner of commentedVideo
  parentComment?: mongoose.Types.ObjectId | null;
  replyToUser?: mongoose.Types.ObjectId | null; // who this reply is addressed to (@mention)

  // Content
  content: string;
  isEdited: boolean;
  editedAt?: Date | null;

  // Counters (denormalized)
  repliesCount: number;
  likesCount: number;

  // Creator interactions
  creatorHearted: boolean;
  isPinned: boolean;
  repliedByCreator: boolean; // only meaningful on top-level comments
  seenByCreator: boolean; // powers unread badge / notifications

  // Moderation
  status: CommentStatus;
  moderationReason?: string | null; // e.g. 'blocked_word', 'contains_link', 'manual'
  removedAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentedVideo: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    videoOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replyToUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },

    repliesCount: { type: Number, default: 0, min: 0 },
    likesCount: { type: Number, default: 0, min: 0 },

    creatorHearted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    repliedByCreator: { type: Boolean, default: false },
    seenByCreator: { type: Boolean, default: false },

    status: {
      type: String,
      enum: COMMENT_STATUS,
      default: 'published',
    },
    moderationReason: { type: String, default: null },
    removedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Public watch page: top-level comments (pinned first), then replies
commentSchema.index({
  commentedVideo: 1,
  parentComment: 1,
  status: 1,
  isPinned: -1,
  createdAt: -1,
});
commentSchema.index({ parentComment: 1, status: 1, createdAt: 1 });

// Creator studio: all comments across the creator's videos
commentSchema.index({ videoOwner: 1, status: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({
  videoOwner: 1,
  parentComment: 1,
  repliedByCreator: 1,
  status: 1,
  createdAt: -1,
}); // "Needs reply" tab
commentSchema.index({ videoOwner: 1, seenByCreator: 1 }); // unread count

// Enforce a single pinned comment per video
commentSchema.index(
  { commentedVideo: 1 },
  { unique: true, partialFilterExpression: { isPinned: true } },
);

// Search by comment text
commentSchema.index({ content: 'text' });

const Comment = models?.Comment || model<IComment>('Comment', commentSchema);

export default Comment;