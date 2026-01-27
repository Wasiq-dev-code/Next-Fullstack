'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { useNotification } from '@/components/providers/notification';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [isPrivate, setIsPrivate] = useState<boolean>(
    Boolean(session?.user?.isPrivate),
  );
  const [privacyLoading, setPrivacyLoading] = useState(false);

  // prefill current email
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  async function updateEmail() {
    try {
      setLoading(true);

      const res = await apiClient.changeFields({ email });
      showNotification(
        res.message ?? 'Email updated. Please sign in again.',
        'success',
      );

      // backend sets emailChangedAt, session should be invalid
      // force logout for clean UX
      setTimeout(() => {
        signOut({ callbackUrl: '/login' });
      }, 1500);
    } catch (err: any) {
      showNotification(
        err?.response?.data?.error || 'Failed to update email',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  async function togglePrivacy() {
    try {
      setPrivacyLoading(true);

      const res = await apiClient.togglePrivateProfile();

      setIsPrivate(res.isPrivate);
      showNotification(res.message, 'success');
    } catch (err: any) {
      showNotification(
        err?.response?.data?.error || 'Failed to update privacy',
        'error',
      );
    } finally {
      setPrivacyLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account email and related settings
        </p>
      </div>

      <Alert>
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Changing your email will sign you out of all active sessions.
        </AlertDescription>
      </Alert>

      <section className="space-y-3 max-w-md">
        <label className="text-sm font-medium">Email address</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          onClick={updateEmail}
          disabled={loading || !email || email === session?.user?.email}
        >
          Update Email
        </Button>
      </section>
      <section className="space-y-4 max-w-md border-t pt-6">
        <div>
          <h2 className="font-medium">Private account</h2>
          <p className="text-sm text-muted-foreground">
            When enabled, only approved users can see your profile and videos.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="private-mode">Private profile</Label>
          <Switch
            id="private-mode"
            checked={isPrivate}
            disabled={privacyLoading}
            onCheckedChange={togglePrivacy}
          />
        </div>
      </section>
    </div>
  );
}
