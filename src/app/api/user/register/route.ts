import crypto from 'crypto';
import { connectToDatabase } from '@/lib/database/db';
import { registerUserSchema } from '@/validators/registerUser.schema';
import User from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/Email';
import { verifyRecaptchaV3Token, verifyTurnstileToken } from '@/lib/captcha';

const generateVerifyCode = () => crypto.randomInt(100000, 1000000).toString();
const VERIFY_CODE_TTL_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (
      !(await verifyTurnstileToken(body?.captchaToken, 'register', remoteIp)) ||
      !(await verifyRecaptchaV3Token(body?.recaptchaToken, 'register', remoteIp))
    ) {
      return NextResponse.json(
        { error: 'Complete the security check and try again.' },
        { status: 400 },
      );
    }

    console.log('Received registration request:', {
      username: body?.username,
      email: body?.email,
      hasProfilePhoto: Boolean(body?.profilePhoto),
      hasLocation: Boolean(body?.location),
    });

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

    await connectToDatabase();

    const existingUser = await User.findOne({ email: data.email }).setOptions({
      bypassMiddleware: true,
    });

    if (existingUser) {
      if (!existingUser.isVerified && existingUser.provider === 'credentials') {
        const verifyCode = generateVerifyCode();
        const verifyCodeExpiry = new Date(Date.now() + VERIFY_CODE_TTL_MS);

        existingUser.username = data.username;
        existingUser.password = data.password;
        existingUser.profilePhoto = data.profilePhoto;
        existingUser.location = data.location;          // NEW
        existingUser.preferences = data.preferences;    // NEW
        existingUser.verifyCode = verifyCode;
        existingUser.verifyCodeExpiry = verifyCodeExpiry;
        await existingUser.save();

        await sendVerificationEmail(data.email, data.username, verifyCode);

        return NextResponse.json(
          {
            message: 'Verification email resent successfully',
            userId: existingUser._id?.toString(),
          },
          { status: 201 }
        );
      }

      return NextResponse.json(
        {
          error: 'An account with this email already exists. Please log in instead.',
          code: 'EMAIL_ALREADY_REGISTERED',
        },
        { status: 409 }
      );
    }

    const verifyCode = generateVerifyCode();
    const verifyCodeExpiry = new Date(Date.now() + VERIFY_CODE_TTL_MS);

    const newUser = await User.create({
      email: data.email,
      password: data.password,
      profilePhoto: {
        url: data.profilePhoto.url,
        fileId: data.profilePhoto.fileId,
      },
      username: data.username,
      location: {                                        // NEW
        country: data.location.country,
        region: data.location.region,
        city: data.location.city,
      },
      preferences: {                                     // NEW
        language: data.preferences.language,
        timezone: data.preferences.timezone,
      },
      role: 'USER',
      provider: 'credentials',
      isVerified: false,
      verifyCode,
      verifyCodeExpiry,
    });

    try {
      await sendVerificationEmail(data.email, data.username, verifyCode);
    } catch (err: unknown) {
      await User.deleteOne({ _id: newUser._id });
      const message = err instanceof Error ? err.message : 'Unable to send verification email';
      return NextResponse.json(
        { error: `Email verification failed: ${message}` },
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
  } catch (error: unknown) {
    console.error('User registration failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to register user';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}