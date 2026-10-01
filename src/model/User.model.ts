import mongoose, { model, models, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'USER'
  | 'CREATOR'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPERADMIN';

// Secondary access
export interface ISecondaryAccess {
  userId: mongoose.Types.ObjectId;
  role: UserRole;
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

  // CASL / authorization role
  role: UserRole;

  profilePhoto: {
    url: string;
    fileId: string;
  };

  isVerified: boolean;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
  passwordResetTokenHash?: string;
  passwordResetTokenExpiry?: Date;

  isPrivate?: boolean;
  passwordChangedAt?: Date;
  emailChangedAt?: Date;

  provider: string;

  secondaryAccess?: ISecondaryAccess[];

  location:{
    country:  String, 
    region:   String, 
    city:     String, 
  };

  preferences:{
    language: String, 
    timezone: String
  } 

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
    enum: ['USER', 'CREATOR', 'MODERATOR', 'ADMIN', 'SUPERADMIN'],
    default: 'USER',
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

    // CASL role
    role: {
      type: String,
      enum: ['USER', 'CREATOR', 'MODERATOR', 'ADMIN', 'SUPERADMIN'],
      default: 'USER',
      required: true,
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
      url: {
        type: String,
      },
      fileId: {
        type: String,
      },
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

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetTokenExpiry: {
      type: Date,
      select: false,
    },

     location: {
     country: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // Automatically converts "pk" to "PK"
      minLength: 2,
      maxLength: 2     // Restricts to 2-letter ISO codes
    },
    region: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Grouping localization preferences together
  preferences: {
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: 'en',
      minLength: 2,
      maxLength: 5     // Accommodates formats like "en" or "en-US"
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
      default: 'UTC'   // Valid standard string like "Asia/Karachi"
    }
  },

    provider: {
      type: String,
      enum: ['credentials', 'google'],
      required: true,
    },

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

userSchema.index({ 'location.country': 1, 'location.region': 1, 'location.city': 1 });
userSchema.index({ 'preferences.language': 1 });

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = models?.User || model<IUser>('User', userSchema);

export default User;