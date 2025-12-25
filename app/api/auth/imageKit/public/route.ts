// /api/imagekit/auth/public
import { getUploadAuthParams } from '@imagekit/next/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { token, expire, signature } = getUploadAuthParams({
    privateKey: process.env.IMAGE_PRIVATE_KEY!,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY!,
  });

  return NextResponse.json({
    token,
    expire,
    signature,
  });
}
