import { getUploadAuthParams } from '@imagekit/next/server';
import { requireAuth } from '@/lib/validations/requireAuth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.error;

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGE_PRIVATE_KEY!,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY!,
    });

    return NextResponse.json({
      token,
      expire,
      signature,
      userId: auth.data,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY,
    });
  } catch (error) {
    console.error('ImageKit private auth error:', error);
    return NextResponse.json(
      { error: 'Authentication for ImageKit failed' },
      { status: 500 }
    );
  }
}