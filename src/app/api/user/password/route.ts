import { authOptions } from '@/src/lib/auth';
import { connectToDatabase } from '@/src/lib/db';
import { passwordChangeSchema } from '@/src/lib/validators/passwordChange.schema';
import User from '@/src/model/User.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized Request' },
        { status: 401 },
      );
    }

    const body = await req.json();

    const parsed = passwordChangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { oldPassword, newPassword } = parsed.data;

    await connectToDatabase();

    const user = await User.findById(session.user.id).select('+password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await user.isPasswordCorrect(oldPassword);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Old password is incorrect' },
        { status: 400 },
      );
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Password change failed', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 },
    );
  }
}
