import { connectToDatabase } from '@/lib/db';
import {
  deleteFileFromImageKit,
  getImageKitFileOwner,
} from '@/lib/imageKitOps';
import { requireAuth } from '@/lib/requireAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: { fileId: string };
  },
) {
  try {
    await connectToDatabase();
    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const userId = auth.data;

    if (!params?.fileId) {
      return NextResponse.json(
        { error: 'fileId missing in params' },
        { status: 400 },
      );
    }

    const owner = await getImageKitFileOwner(params.fileId);

    if (!owner || owner !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this file' },
        { status: 403 },
      );
    }
    const deleted = await deleteFileFromImageKit(params.fileId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete file from ImageKit' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: 'File deleted successfully',
        fileId: params.fileId,
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
