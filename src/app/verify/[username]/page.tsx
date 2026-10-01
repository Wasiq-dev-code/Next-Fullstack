'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/Api-client/api-client';
import { useNotification } from '@/components/notification';
import AuthShell from '@/components/auth/AuthShell';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import Link from 'next/link';

function getVerificationError(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: 'Verification failed. Please try again.', alreadyVerified: false };
  }

  try {
    const response = JSON.parse(error.message) as { error?: unknown; code?: unknown };
    if (typeof response.error === 'string') {
      return {
        message: response.error,
        alreadyVerified: response.code === 'EMAIL_ALREADY_VERIFIED',
      };
    }
  } catch {
    return {
      message: error.message || 'Verification failed. Please try again.',
      alreadyVerified: false,
    };
  }

  return {
    message: error.message || 'Verification failed. Please try again.',
    alreadyVerified: false,
  };
}

export default function VerifyPage() {
  const [code, setCode] = useState<string>('');
  const { username } = useParams();
  const [err, setErr] = useState<boolean>(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { showNotification } = useNotification();

  const handleVerify = async () => {
    if (submitting) return;
    if (!/^\d{6}$/.test(code)) {
      setErr(true);
      setErrorMessage('Enter the 6-digit code from your email.');
      inputRef.current?.focus();
      return;
    }
    if (!captchaToken) {
      setErr(true);
      setErrorMessage('Complete the security check before continuing.');
      return;
    }

    setSubmitting(true);
    try {
      setErr(false);
      setAlreadyVerified(false);
      setErrorMessage('');

      const verifyCode = await apiClient.emailVerification({
        username: username as string,
        code,
        captchaToken,
      });

      if (!verifyCode) {
        throw new Error('Verifycode Err');
      }
      showNotification('User Registered Successfully', 'success');
      router.replace('/login');

      setCode('');
    } catch (error: unknown) {
      const result = getVerificationError(error);
      setErr(true);
      setAlreadyVerified(result.alreadyVerified);
      setErrorMessage(result.message);
      if (result.alreadyVerified) {
        showNotification('Your email is already verified. Signing you in...', 'success');
        router.replace('/login');
      } else {
        showNotification(result.message, 'error');
      }
    } finally {
      setSubmitting(false);
      setCaptchaToken(null);
      setCaptchaKey((key) => key + 1);
    }
  };

  return (
    <AuthShell>
      <div className="space-y-7">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase text-violet-300">One last step</p>
          <h1 className="text-2xl font-semibold text-white">Verify your email</h1>
          <p className="text-sm leading-6 text-zinc-400">Enter the 6-digit code we sent to your inbox to activate your Echo account.</p>
        </header>

        <form onSubmit={(event) => { event.preventDefault(); void handleVerify(); }} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="verification-code" className="text-sm font-medium text-zinc-300">Verification code</label>
            <input
              ref={inputRef}
              id="verification-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              disabled={submitting}
              aria-invalid={err && !alreadyVerified}
              aria-describedby={err ? 'verification-error' : undefined}
              className="h-12 w-full rounded-lg border border-white/10 bg-[#17171d] px-4 text-center font-mono text-xl text-white placeholder:text-zinc-700 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 aria-[invalid=true]:border-red-400/70"
            />
            {err && (alreadyVerified ? (
              <p id="verification-error" role="status" className="text-sm text-emerald-300">
                {errorMessage}{' '}
                <Link href="/login" className="font-semibold text-violet-300 underline underline-offset-2">Sign in</Link>
              </p>
            ) : (
              <p id="verification-error" role="alert" className="text-xs text-red-400">{errorMessage}</p>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400">Security check</p>
            <TurnstileCaptcha key={captchaKey} action="verify" onTokenChange={setCaptchaToken} />
          </div>

          <button
            type="submit"
            disabled={submitting || !captchaToken}
            aria-busy={submitting}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {submitting ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
