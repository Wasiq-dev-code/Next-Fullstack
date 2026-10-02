'use client';

import AuthShell from '@/components/auth/AuthShell';
import RecaptchaV3, { type RecaptchaV3Handle } from '@/components/auth/RecaptchaV3';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const recaptchaRef = useRef<RecaptchaV3Handle>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const recaptchaToken = await recaptchaRef.current?.execute();
      if (!recaptchaToken) {
        throw new Error('Google reCAPTCHA is not ready. Please try again.');
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword, recaptchaToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.issues?.confirmPassword?.[0] ?? data.error ?? 'Unable to reset your password.');
        return;
      }

      router.replace('/login?passwordReset=success');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to reset your password. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-7">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase text-violet-300">Account recovery</p>
          <h1 className="text-2xl font-semibold text-white">Set a new password</h1>
          <p className="text-sm text-zinc-400">Choose a password with at least 8 characters.</p>
        </header>

        {!token ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm text-red-300">
              This reset link is missing or invalid. Request a new one to continue.
            </p>
            <Link href="/forgot-password" className="inline-block text-sm font-medium text-violet-300 hover:text-violet-200 hover:underline">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm font-medium text-zinc-300">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#17171d] px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium text-zinc-300">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#17171d] px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

            <RecaptchaV3 ref={recaptchaRef} action="reset_password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101014] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? 'Updating password...' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-violet-300 hover:text-violet-200 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-57px)] bg-[#0e0f11]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
