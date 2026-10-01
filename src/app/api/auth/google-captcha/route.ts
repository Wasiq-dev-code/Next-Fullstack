import {
  createGoogleCaptchaProof,
  GOOGLE_CAPTCHA_COOKIE,
  verifyTurnstileToken,
} from '@/lib/captcha';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    if ((action !== 'login' && action !== 'register') || !(await verifyTurnstileToken(token, action, remoteIp))) {
      return NextResponse.json({ error: 'Complete the security check and try again.' }, { status: 400 });
    }

    const response = NextResponse.json({ verified: true });
    response.cookies.set(GOOGLE_CAPTCHA_COOKIE, createGoogleCaptchaProof(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/callback/google',
      maxAge: 5 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to verify the security challenge.' }, { status: 503 });
  }
}