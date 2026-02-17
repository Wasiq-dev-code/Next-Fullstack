import { connectToDatabase } from '@/lib/database/db';
import { deleteFileFromImageKit } from '@/lib/videofallback/imageKitOps';
import { withVideoAuth } from '@/lib/validations/withVideoAuth';
import Video from '@/model/Video.model';
import { NextRequest, NextResponse } from 'next/server';

// Delete video
export async function DELETE(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    await connectToDatabase();

    const guard = await withVideoAuth(params.videoId);
    if (!guard.ok) return guard.error;

    const video = guard.data.video;

    if (video.thumbnail?.fileId) {
      await deleteFileFromImageKit(video.thumbnail.fileId);
    }

    if (video.video?.fileId) {
      await deleteFileFromImageKit(video.video.fileId);
    }

    await Video.deleteOne({ _id: video._id });

    return NextResponse.json(
      { message: 'Video deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('DELETE VIDEO ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 },
    );
  }
}
