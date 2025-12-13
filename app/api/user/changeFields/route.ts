import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/model/User.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, email } = await req.json();

    if (!username && !email) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await connectToDatabase();

    const updateData: Record<string, any> = {};

    if (username) {
      if (username.length < 3) {
        return NextResponse.json(
          { error: 'Username too short' },
          { status: 400 },
        );
      }
      updateData.username = username;
    }

    if (email) {
      if (!email.includes('@')) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
      }

      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 },
        );
      }

      updateData.email = email;
      updateData.emailChangedAt = new Date(); // 🔐 force logout
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select('-password');

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Changing fields failed', error);
    return NextResponse.json(
      { error: 'Error while changing fields' },
      { status: 500 },
    );
  }
}
