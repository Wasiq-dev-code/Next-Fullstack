import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/validations/auth';
import { connectToDatabase } from '@/lib/database/db';
import User, { UserRole } from '@/model/User.model';
import { defineAbilityFor } from '@/lib/ability';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

const ELEVATED_ROLES: UserRole[] = ['ADMIN', 'SUPERADMIN'];

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    // 1. Get logged-in session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // 2. Create CASL ability
    const ability = defineAbilityFor({
      id: session.user.id,
      role: session.user.role,
    });

    // 3. Check whether current user can manage users
    if (!ability.can('manage', 'User')) {
      return NextResponse.json(
        { error: 'You do not have permission to change user roles' },
        { status: 403 },
      );
    }

    // 4. Get target user ID
    const { userId } = await params;

    // 5. Validate request body
    const body = await request.json().catch(() => null);
    const requestedRole = body?.role as UserRole;

    const validRoles: UserRole[] = [
      'USER',
      'CREATOR',
      'MODERATOR',
      'ADMIN',
      'SUPERADMIN',
    ];

    if (!requestedRole || !validRoles.includes(requestedRole)) {
      return NextResponse.json(
        {
          error: 'Invalid role',
          validRoles,
        },
        { status: 400 },
      );
    }

    // 6. Prevent changing your own role
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 },
      );
    }

    // 7. Connect to database
    await connectToDatabase();

    // 8. Find target user
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // 9. Only SUPERADMIN may assign an elevated role (ADMIN/SUPERADMIN)
    if (
      ELEVATED_ROLES.includes(requestedRole) &&
      session.user.role !== 'SUPERADMIN'
    ) {
      return NextResponse.json(
        { error: 'Only SUPERADMIN can assign ADMIN or SUPERADMIN roles' },
        { status: 403 },
      );
    }

    // 10. Only SUPERADMIN may modify a user who is already ADMIN/SUPERADMIN.
    // Without this, an ADMIN could demote another ADMIN or a SUPERADMIN.
    if (
      ELEVATED_ROLES.includes(targetUser.role) &&
      session.user.role !== 'SUPERADMIN'
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this user' },
        { status: 403 },
      );
    }

    // 11. Apply the role change
    const previousRole = targetUser.role;
    targetUser.role = requestedRole;

    await targetUser.save();

    // Audit trail — replace with a real audit log/collection if you have one
    console.log(
      `[role-change] actor=${session.user.id} target=${targetUser._id} ${previousRole}->${requestedRole} at=${new Date().toISOString()}`,
    );

    // 12. Return updated user
    return NextResponse.json(
      {
        message: 'User role updated successfully',
        user: {
          id: targetUser._id.toString(),
          username: targetUser.username,
          email: targetUser.email,
          role: targetUser.role,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Failed to update user role:', error);

    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 },
    );
  }
}