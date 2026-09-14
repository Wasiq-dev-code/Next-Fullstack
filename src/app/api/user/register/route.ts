import { connectToDatabase } from '@/lib/database/db';
import { registerUserSchema } from '@/validators/registerUser.schema';
import User from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/Email';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse incoming JSON body once
    const body = await request.json();

    console.log('Received registration request:', {
      username: body?.username,
      email: body?.email,
      hasProfilePhoto: Boolean(body?.profilePhoto),
    });

    // 2. Validate input schema directly on the parsed object
    const parsed = registerUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 3. Connect to database
    await connectToDatabase();

    // 4. Check for existing user
    const existingUser = await User.findOne({ email: data.email }).setOptions({
      bypassMiddleware: true,
    });

    if (existingUser) {
      if (!existingUser.isVerified && existingUser.provider === 'credentials') {
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

        existingUser.username = data.username;
        existingUser.password = data.password;
        existingUser.profilePhoto = data.profilePhoto;
        existingUser.verifyCode = verifyCode;
        existingUser.verifyCodeExpiry = verifyCodeExpiry;
        await existingUser.save();

        await sendVerificationEmail(data.email, data.username, verifyCode);

        return NextResponse.json(
          {
            message: 'Verification email resent successfully',
            userId: existingUser._id?.toString(),
          },
          { status: 201 },
        );
      }

      return NextResponse.json(
        {
          error: 'An account with this email already exists. Please log in instead.',
          code: 'EMAIL_ALREADY_REGISTERED',
        },
        { status: 409 },
      );
    }

    // 5. Generate verification code & expiry
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 6. Create User document
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

    // 7. Send verification email with cleanup fallback
    try {
      await sendVerificationEmail(data.email, data.username, verifyCode);
    } catch (err: any) {
      await User.deleteOne({ _id: newUser._id });
      return NextResponse.json(
        { error: `Email verification failed: ${err?.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: newUser._id?.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('User registration failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
