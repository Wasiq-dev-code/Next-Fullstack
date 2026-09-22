import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/validations/auth';
import { connectToDatabase } from '@/lib/database/db';
import User from '@/model/User.model';

export async function PATCH() {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Atomically upgrade only if the user is verified and currently a plain USER.
    // This avoids race conditions from separate findById + save calls, and
    // avoids re-validating the whole document via .save().
    const upgradedUser = await User.findOneAndUpdate(
      {
        _id: session.user.id,
        role: 'USER',
        isVerified: true,
      },
      { $set: { role: 'CREATOR' } },
      { new: true },
    );

    if (upgradedUser) {
      // Lightweight audit trail — replace with a real audit log/collection if you have one
      console.log(
        `[role-upgrade] user=${upgradedUser._id} role=USER->CREATOR at=${new Date().toISOString()}`,
      );

      return NextResponse.json(
        {
          message: 'You are now a creator',
          role: upgradedUser.role,
        },
        { status: 200 },
      );
    }

    // 4. The atomic update didn't match — figure out why, to return the right error
    const existingUser = await User.findById(session.user.id);

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    if (!existingUser.isVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your email before becoming a creator',
        },
        { status: 403 },
      );
    }

    if (existingUser.role === 'CREATOR') {
      return NextResponse.json(
        {
          message: 'You are already a creator',
          role: existingUser.role,
        },
        { status: 200 },
      );
    }

    // Any other role (e.g. ADMIN) can't self-upgrade via this route
    return NextResponse.json(
      {
        error: 'Your current role cannot be changed to CREATOR using this route',
        role: existingUser.role,
      },
      { status: 403 },
    );
  } catch (error: any) {
    // Log full details server-side, but don't leak internals to the client
    console.error('Failed to become creator:', error);

    return NextResponse.json(
      { error: 'Failed to become creator' },
      { status: 500 },
    );
  }
}