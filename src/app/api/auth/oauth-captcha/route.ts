import {
  createOAuthCaptchaProof,
  OAUTH_CAPTCHA_COOKIE,
  verifyRecaptchaV3Token,
  verifyTurnstileToken,
} from '@/lib/captcha';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, recaptchaToken, action, provider } = await request.json();
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    if (
      (provider !== 'google' && provider !== 'github') ||
      (action !== 'login' && action !== 'register') ||
      !(await verifyTurnstileToken(token, action, remoteIp)) ||
      !(await verifyRecaptchaV3Token(recaptchaToken, action, remoteIp))
    ) {
      return NextResponse.json({ error: 'Complete the security check and try again.' }, { status: 400 });
    }

    const response = NextResponse.json({ verified: true });
    response.cookies.set(OAUTH_CAPTCHA_COOKIE, createOAuthCaptchaProof(provider), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: `/api/auth/callback/${provider}`,
      maxAge: 5 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to verify the security challenge.' }, { status: 503 });
  }
}