import mongoose, { model, models, Schema } from 'mongoose';

export interface IFollow {
  _id?: mongoose.Types.ObjectId;
  follower: mongoose.Types.ObjectId;
  account: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: function (value: mongoose.Types.ObjectId) {
          return value?.toString() !== this.follower?.toString();
        },
        message: 'User cannot follow to themselves',
      },
    },
  },
  {
    timestamps: true,
  },
);

// This ensures one user can follow one account only once
followSchema.index({ follower: 1, account: 1 }, { unique: true });

const Follow = models?.Follow || model<IFollow>('Follow', followSchema);

export default Follow;
