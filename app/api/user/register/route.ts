import { connectToDatabase } from '@/lib/db';
import { RegisterUserDTO } from '@/lib/types/user';
import User, { IUser } from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Destructure request json for accessing email and password from client
    const body: RegisterUserDTO = await request.json();

    // Email and password should be fill
    if (
      !body.email ||
      !body.profilePhoto?.url ||
      !body.profilePhoto?.fileId ||
      !body.username ||
      !body.password
    ) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 },
      );
    }

    // Connecting to database before it's operations.
    await connectToDatabase();

    const existingUser = await User.findOne({ email: body.email });

    // User should not be in DB
    if (existingUser) {
      return NextResponse.json(
        { error: 'User is already in DB' },
        { status: 400 },
      );
    }

    // Creating User
    const newUser: IUser = await User.create({
      email: body.email,
      password: body.password,
      profilePhoto: {
        url: body.profilePhoto.url,
        fileId: body.profilePhoto.fileId,
      },
      username: body.username,
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: newUser._id?.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('User registration failed', error);
    return NextResponse.json(
      { error: 'Failed to registered user' },
      { status: 500 },
    );
  }
}
