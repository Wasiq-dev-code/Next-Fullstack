'use client';

import { useNotification } from '@/components/notification';
import { apiClient } from '@/lib/Api-client/api-client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function GoogleSignInButton({
  token,
  action,
  disabled,
  onChallengeConsumed,
}: {
  token: string | null;
  action: 'login' | 'register';
  disabled?: boolean;
  onChallengeConsumed: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleGoogleSignIn = async () => {
    if (!token) {
      showNotification('Complete the security check first', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.authorizeGoogleCaptcha(token, action);
      onChallengeConsumed();
      const result = await signIn('google', { callbackUrl: '/' });
      if (result?.error) showNotification('Google sign-in could not be completed', 'error');
    } catch {
      onChallengeConsumed();
      showNotification('Google sign-in could not be started. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading || !token}
      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Connecting to Google...' : 'Continue with Google'}
    </button>
  );
}