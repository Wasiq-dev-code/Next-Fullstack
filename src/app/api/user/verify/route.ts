import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/captcha';

export async function POST(request: NextRequest) {
  try {
    const { username, code, captchaToken } = await request.json();
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    if (!(await verifyTurnstileToken(captchaToken, 'verify', remoteIp))) {
      return NextResponse.json(
        { error: 'Complete the security check and try again.' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    if (typeof username !== 'string' || !username.trim()) {
      return NextResponse.json(
        { error: 'A username is required.' },
        { status: 400 },
      );
    }

    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Enter the 6-digit verification code.' },
        { status: 400 },
      );
    }

    const user = await User.findOne({ username: username.trim() }).setOptions({
      bypassMiddleware: true,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          error: 'This email is already verified. Please sign in.',
          code: 'EMAIL_ALREADY_VERIFIED',
        },
        { status: 409 },
      );
    }

    if (!user.verifyCodeExpiry || user.verifyCodeExpiry.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'This verification code has expired. Register again to request a new one.' },
        { status: 400 },
      );
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ error: 'The verification code does not match.' }, { status: 400 });
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Email verified successfully', userId: user._id },
      { status: 200 },
    );
  } catch (error) {
    console.error('Email verification failed:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
