'use client';

import AuthShell from '@/components/auth/AuthShell';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import RecaptchaV3, { type RecaptchaV3Handle } from '@/components/auth/RecaptchaV3';
import Link from 'next/link';
import { useRef, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const recaptchaRef = useRef<RecaptchaV3Handle>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          captchaToken,
          recaptchaToken: await recaptchaRef.current?.execute(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Unable to request a password reset.');
        return;
      }

      setMessage(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to request a password reset. Please try again.',
      );
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((key) => key + 1);
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-7">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase text-violet-300">Account recovery</p>
          <h1 className="text-2xl font-semibold text-white">Forgot your password?</h1>
          <p className="text-sm text-zinc-400">
            Enter your account email and we&apos;ll send you a secure reset link.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="recovery-email" className="text-sm font-medium text-zinc-300">
              Email address
            </label>
            <input
              id="recovery-email"
              autoComplete="email"
              type="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading || Boolean(message)}
              className="h-11 w-full rounded-lg border border-white/10 bg-[#17171d] px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-zinc-400">Security check</p>
            <TurnstileCaptcha
              key={captchaKey}
              action="forgot-password"
              onTokenChange={setCaptchaToken}
            />
            <RecaptchaV3 ref={recaptchaRef} action="forgot_password" />
          </div>

          {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

          {!message && (
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101014] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          )}
        </form>

        <p className="text-center text-sm text-zinc-500">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-violet-300 hover:text-violet-200 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
