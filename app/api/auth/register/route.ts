import { connectToDatabase } from "@/lib/db";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Destructure request json for accessing email and password from client
    const {email,password} = await request.json()

    // Email and password should be fill
    if(!email || !password) {
      return NextResponse.json(
        {error: "Email and password are required"},
        {status: 400}
      )
    }

    // Connecting to database before it's operations.
    await connectToDatabase()


    const existingUser = await User.findOne({email})

    // User should not be in DB
    if(existingUser) {
      return NextResponse.json(
        {error: "User are already in DB"},
        {status: 400}
      )
    }

    // Creating User
    const newUser = await User.create({
      email,
      password
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