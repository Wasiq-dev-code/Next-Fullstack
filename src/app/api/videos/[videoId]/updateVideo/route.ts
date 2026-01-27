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

    // It will check authorize user and ownership of user
    const guard = await withVideoAuth(videoId);
    if (!guard.ok) return guard.error;

    const body = await req.json();

    // Validating with zod
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

    // If no fields available then send this response
    if (!title && !description && !thumbnail) {
      return NextResponse.json(
        { error: 'No fields provided to update' },
        { status: 400 },
      );
    }

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

    video.updatedAt = new Date();
    await video.save();

    return NextResponse.json(
      {
        message: 'Video updated successfully',
        video: {
          id: video._id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          updatedAt: video.updatedAt,
        },
      },
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
