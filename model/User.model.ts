import mongoose, {model,models,Schema} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  email: string
  password:string
  username: string
  profilePhoto: string
  passwordChangedAt?: Date
  _id?:mongoose.Types.ObjectId
  createdAt?:Date
  updatedAt?:Date
}

//generics<IUser>
const userSchema = new Schema<IUser>({
  username: {
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },

  profilePhoto: {
     type:String,
    required:true
  },

  passwordChangedAt: {
    type: Date
  }
}
,{
  timestamps:true
})

userSchema.pre("save", async function(next) {
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password,10)
  }
  next()
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

const User = models?.User || model<IUser>("User", userSchema)

export default User