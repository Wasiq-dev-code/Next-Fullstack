'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/Api-client/api-client';
import { useNotification } from '@/components/notification';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondaryCode, setSecondaryCode] = useState('');
  const [secondaryCodeSent, setSecondaryCodeSent] = useState(false);
  const [secondaryVerified, setSecondaryVerified] = useState(false);
  const [currentSecondaryEmail, setCurrentSecondaryEmail] = useState('');
  const [editingSecondaryEmail, setEditingSecondaryEmail] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);

  const [isPrivate, setIsPrivate] = useState<boolean>(
    Boolean(session?.user?.isPrivate),
  );
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    apiClient
      .getSecondaryEmail()
      .then(({ secondaryEmail: savedEmail, secondaryEmailVerified: verified }) => {
        if (savedEmail) {
          setSecondaryEmail(savedEmail);
          setCurrentSecondaryEmail(verified ? savedEmail : '');
        }
        setSecondaryVerified(verified);
        setSecondaryCodeSent(Boolean(savedEmail && !verified));
      })
      .catch(() => {
        showNotification('Failed to load secondary email', 'error');
      });
  }, [session?.user?.id, showNotification]);

  async function togglePrivacy() {
    try {
      setPrivacyLoading(true);
      const res = await apiClient.togglePrivateProfile();
      setIsPrivate(res.isPrivate);
      showNotification(res.message, 'success');
    } catch {
      showNotification('Failed to update privacy', 'error');
    } finally {
      setPrivacyLoading(false);
    }
  }

  async function requestSecondaryCode() {
    try {
      setSecondaryLoading(true);
      const res = await apiClient.requestSecondaryEmailCode(secondaryEmail);
      setSecondaryCodeSent(true);
      showNotification(res.message, 'success');
    } catch {
      showNotification('Failed to send secondary email code', 'error');
    } finally {
      setSecondaryLoading(false);
    }
  }

  async function verifySecondary() {
    try {
      setSecondaryLoading(true);
      const res = await apiClient.verifySecondaryEmail(
        secondaryEmail,
        secondaryCode,
      );
      setSecondaryVerified(true);
      setCurrentSecondaryEmail(secondaryEmail.trim().toLowerCase());
      setEditingSecondaryEmail(false);
      showNotification(res.message, 'success');
    } catch {
      showNotification('Invalid or expired verification code', 'error');
    } finally {
      setSecondaryLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-8 text-slate-100">
      <div>
        <h2 className="text-xl font-bold text-white sm:text-2xl">Account Settings</h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
          Manage your registered email and profile visibility preferences.
        </p>
      </div>

      {/* Primary Email */}
      <section className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-slate-200">
            Primary Email
          </Label>
          <p className="mt-2 break-all rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
            {session?.user?.email ?? 'No primary email available'}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Your primary email cannot be changed.
          </p>
        </div>
      </section>

      {/* Secondary Email Section */}
      <section className="space-y-4 border-t border-slate-800 pt-6">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Secondary Email</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
            Add another verified email that can be used to sign in to this account.
            The verification code will be sent to both email addresses.
          </p>
        </div>

        {currentSecondaryEmail && secondaryVerified && (
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-300">
              Current secondary email
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {currentSecondaryEmail}
            </p>
            <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-emerald-300">
                Verified and available for sign in
              </p>
              {!editingSecondaryEmail && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSecondaryEmail('');
                    setSecondaryCode('');
                    setSecondaryCodeSent(false);
                    setSecondaryVerified(false);
                    setEditingSecondaryEmail(true);
                  }}
                  className="h-8 w-full border-0 bg-violet-600 px-3 text-xs font-medium text-white shadow-sm shadow-violet-950/30 hover:bg-violet-500 sm:w-auto"
                >
                  Change
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Input
            id="secondary-email"
            type="email"
            value={secondaryEmail}
            onChange={(event) => {
              setSecondaryEmail(event.target.value);
              setSecondaryCodeSent(false);
              setSecondaryVerified(false);
            }}
            placeholder="secondary@example.com"
            disabled={secondaryVerified && !editingSecondaryEmail}
            className="w-full border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
          />

          {secondaryVerified ? null : !secondaryCodeSent ? (
            <Button
              onClick={requestSecondaryCode}
              disabled={secondaryLoading || !secondaryEmail || !session?.user?.email}
              className="w-full cursor-pointer bg-violet-600 text-white transition-colors hover:bg-violet-700 sm:w-auto"
            >
              {secondaryLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                id="secondary-code"
                inputMode="numeric"
                maxLength={6}
                value={secondaryCode}
                onChange={(event) => setSecondaryCode(event.target.value)}
                placeholder="Enter 6-digit code"
                disabled={secondaryVerified}
                className="w-full border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
              />
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button
                  onClick={verifySecondary}
                  disabled={secondaryLoading || secondaryCode.length !== 6 || secondaryVerified}
                  className="w-full cursor-pointer bg-violet-600 text-white transition-colors hover:bg-violet-700 sm:w-auto"
                >
                  {secondaryVerified ? 'Email Verified' : 'Verify Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={requestSecondaryCode}
                  disabled={secondaryLoading}
                  className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white sm:w-auto"
                >
                  Resend Code
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Privacy Section */}
      <section className="space-y-4 border-t border-slate-800 pt-6">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">Private Account</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
            When enabled, only approved followers will be able to view your profile and content.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-800/80 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Label htmlFor="private-mode" className="cursor-pointer text-sm font-medium text-slate-200">
            Private Profile Mode
          </Label>
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