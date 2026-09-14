import mongoose, { model, models, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define an interface for secondary access
export interface ISecondaryAccess {
  userId: mongoose.Types.ObjectId;
  role: 'editor' | 'viewer' | 'admin';
  grantedAt: Date;
}

export interface IUser {
  email: string;
  secondaryEmail?: string;
  secondaryEmailVerified?: boolean;
  secondaryEmailVerifyCode?: string;
  secondaryEmailVerifyCodeExpiry?: Date;
  password?: string;
  username: string;
  profilePhoto: {
    url: string;
    fileId: string;
  };
  isVerified: boolean;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
  isPrivate?: boolean;
  passwordChangedAt?: Date;
  emailChangedAt?: Date;
  provider: string;
  secondaryAccess?: ISecondaryAccess[]; // Added secondary access
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const secondaryAccessSchema = new Schema<ISecondaryAccess>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['editor', 'viewer', 'admin'],
    default: 'viewer',
    required: true,
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    secondaryEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    secondaryEmailVerified: {
      type: Boolean,
      default: false,
    },
    secondaryEmailVerifyCode: {
      type: String,
      select: false,
    },
    secondaryEmailVerifyCodeExpiry: {
      type: Date,
      select: false,
    },
    password: {
      type: String,
      required: false,
    },
    profilePhoto: {
      url: { type: String },
      fileId: { type: String },
    },
    passwordChangedAt: {
      type: Date,
    },
    emailChangedAt: {
      type: Date,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyCode: {
      type: String,
    },
    verifyCodeExpiry: {
      type: Date,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      required: true,
    },
    // Added field to the main schema
    secondaryAccess: [secondaryAccessSchema],
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = models?.User || model<IUser>('User', userSchema);

export default User;