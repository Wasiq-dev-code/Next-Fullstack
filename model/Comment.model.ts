import mongoose,{model,models,Schema} from "mongoose"

export interface IComment {
  commentedBy: mongoose.Types.ObjectId,
  commentedVideo: mongoose.Types.ObjectId,
  parentComment?: mongoose.Types.ObjectId | null,
  content: string,
  _id?:mongoose.Types.ObjectId,
  createdAt?:Date,
  updatedAt?:Date  
}

const commentSchema = new Schema<IComment>({
     commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
},
{
  timestamps: true
}
)

commentSchema.index({ commentedVideo: 1, parentComment: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = models?.Comment || model<IComment>("Comment", commentSchema)

export default Comment