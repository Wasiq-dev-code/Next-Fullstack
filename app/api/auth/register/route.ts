import { connectToDatabase } from "@/lib/db";
import User, { IUser } from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Destructure request json for accessing email and password from client
    const body:IUser = await request.json()

    // Email and password should be fill
    if(
      !body.email ||
      !body.profilePhoto ||
      !body.username ||
      !body.password
    ) {
      return NextResponse.json(
            {error:"Required fields missing"}, 
            {status:400}
          )
    }

    // Connecting to database before it's operations.
    await connectToDatabase()

    const existingUser = await User.findOne({email:body.email})

    // User should not be in DB
    if(existingUser) {
      return NextResponse.json(
        {error: "User are already in DB"},
        {status: 400}
      )
    }

    // Creating User
    const newUser = await User.create({
      email:body.email,
      password:body.password,
      profilePhoto: body.profilePhoto,
      username: body.username
    })

    // Converting mongoose doc to js object and removing the password for better security
    const userResponse = newUser.toObject()
    delete userResponse.password


     return NextResponse.json(
        {
          message: "User registered successfully",
          user: newUser
        },
        {status: 201}
      )


  } catch (error) {
    console.error("User registration failed", error)
    return NextResponse.json(
        {error: "Failed to registered user"},
        {status: 500}
      )
  }
}