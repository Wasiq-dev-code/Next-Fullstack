import { getUploadAuthParams } from '@imagekit/next/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const authParams = getUploadAuthParams({
      privateKey: process.env.IMAGE_PRIVATE_KEY!,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY!,
    });

    return NextResponse.json({
      ...authParams,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate auth params' },
      { status: 500 }
    );
  }
}