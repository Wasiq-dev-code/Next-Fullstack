import mongoose, {model,models,Schema} from "mongoose";

export interface ILike {
  _id?:mongoose.Types.ObjectId,
  video?: mongoose.Types.ObjectId,
  comment?: mongoose.Types.ObjectId,
  userLiked: mongoose.Types.ObjectId,
  createdAt?:Date,
  updatedAt?:Date
}

const likeSchema = new Schema<ILike>( {
   video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: false,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: false,
    },
    userLiked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
}, {
  timestamps:true
})

//Validator for Like Schema
likeSchema.pre("save", function (next) {
  if (!this.video && !this.comment) {
    return next(new Error("Either video or comment must be provided."));
  }
  if (this.video && this.comment) {
    return next(new Error("Only one of video or comment should be provided."));
  }
  next();
});

// Ensure a user can like a video only once
likeSchema.index({ userLiked: 1, video: 1 }, { unique: true, sparse: true });

// Ensure a user can like a comment only once
likeSchema.index({ userLiked: 1, comment: 1 }, { unique: true, sparse: true });

const Like = models?.Like || model<ILike>("Like", likeSchema)

export default Like