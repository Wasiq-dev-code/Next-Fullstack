import { connectToDatabase } from '@/lib/db';
import { RegisterUserDTO } from '@/lib/types/user';
import { registerUserSchema } from '@/lib/validators/registerUser.schema';
import User, { IUser } from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Destructure request json for accessing email and password from client
    const body = await request.json();

    const bodyData: RegisterUserDTO = JSON.parse(body);

    const parsed = registerUserSchema.safeParse(bodyData);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Connecting to database before it's operations.
    await connectToDatabase();

    const existingUser = await User.findOne({ email: data.email });

    // User should not be in DB
    if (existingUser) {
      return NextResponse.json(
        { error: 'User is already in DB' },
        { status: 409 },
      );
    }

    // Creating User
    const newUser: IUser = await User.create({
      email: data.email,
      password: data.password,
      profilePhoto: {
        url: data.profilePhoto.url,
        fileId: data.profilePhoto.fileId,
      },
      username: data.username,
      provider: 'credentials',
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
