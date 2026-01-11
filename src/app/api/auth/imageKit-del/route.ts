import { NextRequest, NextResponse } from 'next/server';
import { getImageKit } from '@/src/lib/imagekit.server';

// This route is for deleting files during failed registration
// No auth required since the file was just uploaded by the same user
export async function DELETE(req: NextRequest) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId required' }, { status: 400 });
    }

    const imagekit = getImageKit();
    await imagekit.deleteFile(fileId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 },
    );
  }
}
