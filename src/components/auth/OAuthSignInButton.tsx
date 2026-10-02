'use client';

import { useNotification } from '@/components/notification';
import { apiClient } from '@/lib/Api-client/api-client';
import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import { useState } from 'react';

export default function OAuthSignInButton({
  token,
  action,
  provider,
  executeRecaptcha,
  disabled,
  onChallengeConsumed,
}: {
  token: string | null;
  action: 'login' | 'register';
  provider: 'google' | 'github';
  executeRecaptcha: () => Promise<string>;
  disabled?: boolean;
  onChallengeConsumed: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const providerName = provider === 'github' ? 'GitHub' : 'Google';

  const handleSignIn = async () => {
    if (!token) {
      showNotification('Complete the security check first', 'error');
      return;
    }

    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha();
      await apiClient.authorizeOAuthCaptcha(token, recaptchaToken, action, provider);
      onChallengeConsumed();
      const result = await signIn(provider, { callbackUrl: '/' });
      if (result?.error) showNotification(`${providerName} sign-in could not be completed`, 'error');
    } catch {
      onChallengeConsumed();
      showNotification(`${providerName} sign-in could not be started. Try again.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={disabled || loading || !token}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {provider === 'github' && <Github aria-hidden="true" size={17} />}
      {loading ? `Connecting to ${providerName}...` : `Continue with ${providerName}`}
    </button>
  );
}