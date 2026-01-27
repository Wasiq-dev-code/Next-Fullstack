import { authOptions } from '@/src/lib/auth';
import { connectToDatabase } from '@/src/lib/db';
import { deleteFileFromImageKit } from '@/src/lib/imageKitOps';
import { changeOtherFieldsSchema } from '@/src/validators/changeOtherFields.schema';
import User from '@/src/model/User.model';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const parsed = changeOtherFieldsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { username, email, profilePhoto } = parsed.data;
    await connectToDatabase();

    const updateData: Partial<{
      username: string;
      email: string;
      profilePhoto: {
        url: string;
        fileId: string;
      };
      emailChangedAt: Date;
    }> = {};

    if (username) {
      updateData.username = username;
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== session.user.id) {
        return NextResponse.json(
          { issues: { email: ['Email already in use'] } },
          { status: 409 },
        );
      }

      updateData.email = email;
      updateData.emailChangedAt = new Date(); // force logout
    }

    if (profilePhoto) {
      const userOldProfilePhoto = await User.findById(session.user.id).select(
        '+profilePhoto.fileId',
      );

      if (profilePhoto.fileId !== userOldProfilePhoto) {
        await deleteFileFromImageKit(userOldProfilePhoto).catch((err) =>
          console.warn('Profilephoto cleanup failed', err),
        );
      }
      updateData.profilePhoto = profilePhoto;
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select('+_id +username +email +profilePhoto');

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Changing fields failed', error);
    return NextResponse.json(
      { error: 'Error while changing fields' },
      { status: 500 },
    );
  }
}
