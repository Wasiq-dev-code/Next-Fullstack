import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, code } = await request.json();

    await connectToDatabase();

    if (!username) {
      return NextResponse.json(
        { error: 'username passing error' },
        { status: 402 },
      );
    }

    const user = await User.findOne({ username }).setOptions({
      bypassMiddleware: true,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    if (user.verifyCodeExpiry < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 });
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Email verified successfully', userId: user._id },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
