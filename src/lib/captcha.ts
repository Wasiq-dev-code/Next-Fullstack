import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export const OAUTH_CAPTCHA_COOKIE = 'echo_oauth_captcha';

export async function verifyTurnstileToken(
  token: unknown,
  action: string,
  remoteIp?: string,
) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (typeof token !== 'string' || !token || !secret) return false;

  const formData = new URLSearchParams({ secret, response: token });
  if (remoteIp) formData.set('remoteip', remoteIp);

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: formData, signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return false;

    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
    };
    return result.success === true && result.action === action;
  } catch {
    return false;
  }
}

export async function verifyRecaptchaV3Token(
  token: unknown,
  action: string,
  remoteIp?: string,
) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (typeof token !== 'string' || !token || !secret) return false;

  const formData = new URLSearchParams({ secret, response: token });
  if (remoteIp) formData.set('remoteip', remoteIp);

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      { method: 'POST', body: formData, signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return false;

    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      score?: number;
    };
    return (
      result.success === true &&
      result.action === action &&
      typeof result.score === 'number' &&
      result.score >= 0.5
    );
  } catch {
    return false;
  }
}

function signProof(payload: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is required');
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createOAuthCaptchaProof(provider: 'google' | 'github') {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = `${expiresAt}.${provider}.${randomBytes(16).toString('hex')}`;
  return `${Buffer.from(payload).toString('base64url')}.${signProof(payload)}`;
}

export function isValidOAuthCaptchaProof(
  proof: string | undefined,
  provider: 'google' | 'github',
) {
  if (!proof) return false;

  const [encodedPayload, signature] = proof.split('.');
  if (!encodedPayload || !signature) return false;

  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString();
    const [expiresAt, proofProvider] = payload.split('.');
    const expected = Buffer.from(signProof(payload));
    const actual = Buffer.from(signature);
    return (
      proofProvider === provider &&
      Number(expiresAt) > Date.now() &&
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}