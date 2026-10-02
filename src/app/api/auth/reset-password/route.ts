import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/db';
import { verifyRecaptchaV3Token } from '@/lib/captcha';
import User from '@/model/User.model';
import { resetPasswordSchema } from '@/validators/passwordReset.schema';

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

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
    if (!(await verifyRecaptchaV3Token(parsed.data.recaptchaToken, 'reset_password', remoteIp))) {
      return NextResponse.json(
        { error: 'Complete the reCAPTCHA check and try again.' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const result = await User.updateOne(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiry: { $gt: new Date() },
        provider: 'credentials',
        password: { $exists: true, $ne: null },
      },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetTokenExpiry: 1,
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired. Request a new one.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json(
      { error: 'Unable to reset your password. Please try again.' },
      { status: 500 },
    );
  }
}
