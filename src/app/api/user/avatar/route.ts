import { authOptions } from '@/lib/validations/auth';
import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';
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

    const { profilePhotoUrl } = await req.json();

    if (
      !profilePhotoUrl ||
      typeof profilePhotoUrl !== 'string' ||
      profilePhotoUrl.trim() === ''
    ) {
      return NextResponse.json(
        { error: 'Invalid profilePhotoUrl' },
        { status: 400 },
      );
    }

    if (!profilePhotoUrl.startsWith('https://ik.imagekit.io/')) {
      return NextResponse.json(
        { error: 'Invalid image source' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          profilePhoto: profilePhotoUrl,
        },
      },
      { new: true, runValidators: true },
    ).select('-password -__v');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        user,
        message: 'Profile photo updated successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Profile Photo change failed', error);
    return NextResponse.json(
      { error: 'Failed to change Profile Photo' },
      { status: 500 },
    );
  }
}
