import { randomBytes, createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/db';
import { sendPasswordResetEmail } from '@/lib/Email';
import { verifyTurnstileToken } from '@/lib/captcha';
import User from '@/model/User.model';
import { forgotPasswordSchema } from '@/validators/passwordReset.schema';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESPONSE = {
  message: 'If an account exists for that email, a password reset link will be sent.',
};

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (!(await verifyTurnstileToken(parsed.data.captchaToken, 'forgot-password', remoteIp))) {
      return NextResponse.json(
        { error: 'Complete the security check and try again.' },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const user = await User.findOne({
      email: parsed.data.email,
      provider: 'credentials',
      password: { $exists: true, $ne: null },
    });

    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(resetToken).digest('hex');
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      },
    );

    const resetUrl = new URL(
      '/reset-password',
      process.env.NEXTAUTH_URL || request.nextUrl.origin,
    );
    resetUrl.searchParams.set('token', resetToken);

    try {
      await sendPasswordResetEmail(user.email, user.username, resetUrl.toString());
    } catch (error) {
      await User.updateOne(
        { _id: user._id, passwordResetTokenHash: tokenHash },
        { $unset: { passwordResetTokenHash: 1, passwordResetTokenExpiry: 1 } },
      );
      throw error;
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('Password reset request failed:', error);
    return NextResponse.json(
      { error: 'Unable to send a password reset email. Please try again later.' },
      { status: 500 },
    );
  }
}
