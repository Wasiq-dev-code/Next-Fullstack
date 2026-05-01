import { connectToDatabase } from '@/lib/database/db';
import { registerUserSchema } from '@/validators/registerUser.schema';
import User from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/Email';

export async function POST(request: NextRequest) {
  try {
    // Destructure request json for accessing email and password from client
    const body = await request.json();

    // const bodyData: RegisterUserDTO = JSON.parse(body);
    const bodyData = JSON.parse(body);

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

    const existingUser = await User.findOne({ email: data.email }).setOptions({
      bypassMiddleware: true,
    });

    // User should not be in DB
    if (existingUser) {
      console.log(existingUser);
      return NextResponse.json(
        { error: 'User is already in DB' },
        { status: 409 },
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Creating User
    const newUser = await User.create({
      email: data.email,
      password: data.password,
      profilePhoto: {
        url: data.profilePhoto.url,
        fileId: data.profilePhoto.fileId,
      },
      username: data.username,
      provider: 'credentials',
      isVerified: false,
      verifyCode,
      verifyCodeExpiry,
    });

    try {
      await sendVerificationEmail(data.email, data.username, verifyCode);
    } catch (err: any) {
      await User.deleteOne({ _id: newUser._id });
      throw new Error(`Email Verification issue: ${err?.message}`);
    }

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

// import bcrypt from 'bcryptjs';
// import prisma from '@/lib/database/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const { email, password, username } = body;

//     // Basic validation
//     if (!email || !password || !username) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 },
//       );
//     }

//     // Check if user exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User already exists' },
//         { status: 409 },
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     const newUser = await prisma.user.create({
//       data: {
//         email,
//         username,
//         password: hashedPassword,
//         provider: 'credentials',
//         isPrivate: false,
//       },
//     });

//     return NextResponse.json(
//       {
//         message: 'User created successfully',
//         user: newUser,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 },
//     );
//   }
// }
