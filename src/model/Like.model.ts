import mongoose, { model, models, Schema } from 'mongoose';

export interface ILike {
  _id?: mongoose.Types.ObjectId;
  video?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  userLiked: mongoose.Types.ObjectId;
  targetOwner: mongoose.Types.ObjectId;
  type:string;
  createdAt?: Date;
  updatedAt?: Date;
}

const likeSchema = new Schema<ILike>(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: false,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: false,
    },
    userLiked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetOwner: { 
      type: Schema.Types.ObjectId,
       ref: 'User',
      required: true
     },

    type: { 
      type: String, enum: ['like', 'dislike'], default: 'like' 
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

likeSchema.path('video').validate(function () {
  return !!this.video !== !!this.comment;
}, 'Either video or comment must be provided, not both.');

// Video likes
likeSchema.index(
  { userLiked: 1, video: 1 },
  { unique: true, partialFilterExpression: { video: { $exists: true } } },
);

// Comment likes
likeSchema.index(
  { userLiked: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } },
);

likeSchema.index({ video: 1, createdAt: -1 }, { partialFilterExpression: { video: { $exists: true } } });
likeSchema.index({ comment: 1, createdAt: -1 }, { partialFilterExpression: { comment: { $exists: true } } });
likeSchema.index({ targetOwner: 1, createdAt: -1 });

const Like = models?.Like || model<ILike>('Like', likeSchema);

export default Like;
