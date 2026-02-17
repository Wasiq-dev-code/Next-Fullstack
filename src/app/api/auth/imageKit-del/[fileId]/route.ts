import { connectToDatabase } from '@/lib/database/db';
import {
  deleteFileFromImageKit,
  getImageKitFileOwner,
} from '@/lib/videofallback/imageKitOps';
import { requireAuth } from '@/lib/validations/requireAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ fileId: string }>;
  },
) {
  try {
    await connectToDatabase();
    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const userId = auth.data;
    const fileId = (await params).fileId;

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId missing in params' },
        { status: 400 },
      );
    }

    const owner = await getImageKitFileOwner(fileId);

    if (!owner || owner !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this file' },
        { status: 403 },
      );
    }
    const deleted = await deleteFileFromImageKit(fileId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete file from ImageKit' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'File deleted successfully',
        fileId: fileId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('ImageKit delete error:', error);
    return NextResponse.json(
      { error: 'Error while deleting file from ImageKit' },
      { status: 500 },
    );
  }
}
