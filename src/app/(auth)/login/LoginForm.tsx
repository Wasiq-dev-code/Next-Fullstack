'use client';

import { useNotification } from '@/components/notification';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import AuthShell from '@/components/auth/AuthShell';
import TurnstileCaptcha from '@/components/auth/TurnstileCaptcha';
import RecaptchaV3, { type RecaptchaV3Handle } from '@/components/auth/RecaptchaV3';
import OAuthSignInButton from '@/components/auth/OAuthSignInButton';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRef } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const recaptchaRef = useRef<RecaptchaV3Handle>(null);

  const { showNotification } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    if (searchParams.get('passwordReset') === 'success') {
      showNotification('Password reset successfully. Please sign in.', 'success');
    } else if (error === 'unauthorized') {
      toast.error('Please login or register to access this page');
    } else if (error === 'session-expired') {
      toast.error('Session expired. Please login again');
    }
  }, [searchParams, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      showNotification('Email and password are required', 'error');
      return;
    }

    if (!captchaToken) {
      showNotification('Complete the security check before continuing', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        captchaToken,
        recaptchaToken: await recaptchaRef.current?.execute(),
      });

      if (result?.error) {
        showNotification(result.error, 'error');
        return;
      }

      showNotification('Login successful', 'success');
      router.push('/');
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Something went wrong',
        'error',
      );
    } finally {
      setCaptchaToken(null);
      setCaptchaKey((key) => key + 1);
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <Toaster />
      <div className="space-y-7">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase text-violet-300">Welcome back</p>
          <h1 className="text-2xl font-semibold text-white">Sign in to Echo</h1>
          <p className="text-sm text-zinc-400">Pick up where your community left off.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-zinc-300">Email address</label>
            <input
              id="login-email"
              autoComplete="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-lg border border-white/10 bg-[#17171d] px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-zinc-300">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-violet-300 hover:text-violet-200 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
              id="login-password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-lg border border-white/10 bg-[#17171d] px-3.5 pr-12 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
              />
              <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-3 grid place-items-center text-zinc-500 transition hover:text-white focus-visible:outline-none focus-visible:text-violet-300">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-zinc-400">Security check</p>
            <TurnstileCaptcha key={captchaKey} action="login" onTokenChange={setCaptchaToken} />
            <RecaptchaV3 ref={recaptchaRef} action="login" />
          </div>
          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101014] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <OAuthSignInButton
          token={captchaToken}
          action="login"
          provider="google"
          executeRecaptcha={async () => {
            const token = await recaptchaRef.current?.execute();
            if (!token) throw new Error('Google reCAPTCHA is not ready.');
            return token;
          }}
          disabled={loading}
          onChallengeConsumed={() => {
            setCaptchaToken(null);
            setCaptchaKey((key) => key + 1);
          }}
        />
        <OAuthSignInButton
          token={captchaToken}
          action="login"
          provider="github"
          executeRecaptcha={async () => {
            const token = await recaptchaRef.current?.execute();
            if (!token) throw new Error('Google reCAPTCHA is not ready.');
            return token;
          }}
          disabled={loading}
          onChallengeConsumed={() => {
            setCaptchaToken(null);
            setCaptchaKey((key) => key + 1);
          }}
        />
        <p className="text-center text-sm text-zinc-500">
          New to Echo?{' '}
          <Link href="/register" className="font-medium text-violet-300 hover:text-violet-200 hover:underline">Create an account</Link>
        </p>
      </div>
    </AuthShell>
  );
}
