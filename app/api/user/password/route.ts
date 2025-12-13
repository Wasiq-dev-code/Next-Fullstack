import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/model/User.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if(!session?.user?.id) 
       {
         return NextResponse.json(
          {error:"Unauthorized Request"}, 
          {status:401}
        )
       }

    const {oldPassword, newPassword} = await req.json()

    if(!oldPassword || !newPassword) {
      return NextResponse.json(
        {error: "fields are missing"},
        {status: 400}
      )
    }

    if(newPassword.length < 8) {
      return NextResponse.json(
        {error: "Password length should be 8"},
        {status: 400}
      )
    }

    if(newPassword === oldPassword) {
       return NextResponse.json(
        {error: "oldPassword and newPassword both are same"},
        {status: 400}
      )
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isMatch = await user.isPasswordCorrect(oldPassword)

    if (!isMatch) {
      return NextResponse.json(
        { error: "Old password is incorrect" },
        { status: 400 }
      );
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date()
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Password change failed", error)
        return NextResponse.json(
            {error: "Failed to change password"},
            {status: 500}
          )
      } 
}
