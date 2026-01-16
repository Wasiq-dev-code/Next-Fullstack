'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { useNotification } from '@/app/components/providers/notification';
import { signOut, useSession } from 'next-auth/react';

export default function SecuritySettingsPage() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;

  async function changePassword() {
    if (!passwordsMatch) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);

      const res = await apiClient.passwordChange(oldPassword, newPassword);

      showNotification(
        res.message ?? 'Password updated successfully',
        'success',
      );

      // clear fields after success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // backend sets passwordChangedAt, session should be invalid
      // force logout for clean UX
      setTimeout(() => {
        signOut({ callbackUrl: '/login' });
      }, 1500);
    } catch (err: any) {
      showNotification(
        err?.response?.data?.error || 'Failed to change password',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  if (session?.user?.provider === '!credentials') {
    return (
      <Alert>
        You signed in using {session.user.provider}. Password changes are
        managed by the provider.
      </Alert>
    );
  }

  if (session?.user?.provider === 'credentials') {
    return (
      <div className="space-y-8 max-w-md">
        <div>
          <h1 className="text-xl font-semibold">Security</h1>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>

        <Alert>
          <AlertTitle>Password requirements</AlertTitle>
          <AlertDescription>
            Use a strong password that you do not use anywhere else.
          </AlertDescription>
        </Alert>

        <section className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current password</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {!passwordsMatch && confirmPassword && (
            <p className="text-sm text-red-600">Passwords do not match</p>
          )}

          <Button
            onClick={changePassword}
            disabled={
              loading ||
              !oldPassword ||
              !newPassword ||
              !confirmPassword ||
              !passwordsMatch
            }
          >
            Update Password
          </Button>
        </section>
      </div>
    );
  }
}
