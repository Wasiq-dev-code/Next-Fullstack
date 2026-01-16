import { connectToDatabase } from '@/lib/db';
import { deleteFileFromImageKit } from '@/lib/imageKitOps';
import { withVideoAuth } from '@/lib/withVideoAuth';
import { changeVideoFields } from '@/validators/changeVideoFields';
import { NextRequest, NextResponse } from 'next/server';

//update Video
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;
    await connectToDatabase();

    const guard = await withVideoAuth(videoId);
    if (!guard.ok) return guard.error;

    const body = await req.json();

    const parsed = changeVideoFields.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Error while validation',
          issue: parsed.error.flatten().fieldErrors,
        },
        {
          status: 409,
        },
      );
    }

    const { title, description, thumbnail } = parsed.data;

    const video = guard.data.video;

    if (title) video.title = title;
    if (description) video.description = description;

    if (
      thumbnail &&
      thumbnail.fileId &&
      video.thumbnail &&
      thumbnail.fileId !== video.thumbnail.fileId
    ) {
      const deleted = await deleteFileFromImageKit(video.thumbnail.fileId);

      if (!deleted) {
        console.warn('Thumbnail cleanup failed');
      }

      video.thumbnail = thumbnail;
    }

    await video.save();

    return NextResponse.json(
      { message: 'Video updated successfully', video },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 },
    );
  }
}
