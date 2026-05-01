'use client';

import { useNotification } from '@/components/notification';
import { apiClient } from '@/lib/Api-client/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  profilePhoto?: string;
  general?: string;
};

export default function useRegisterUser() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profilePhotoId, setProfilePhotoId] = useState<string | null>(null);

  const { showNotification } = useNotification();
  const router = useRouter();

  const canSubmit =
    username.trim() &&
    email.trim() &&
    password.trim() &&
    profilePhotoUrl &&
    profilePhotoId &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrors({});
    setSubmitting(true);

    try {
      const user = await apiClient.registerUser({
        username,
        email,
        password,
        profilePhoto: {
          url: profilePhotoUrl!,
          fileId: profilePhotoId!,
        },
      });

      if (!user) {
        throw new Error('Backend error');
      }

      showNotification('User Registered Successfully', 'success');
      console.log('redirecting to:', `/verify/${username}`);
      router.push(`/verify/${username}`);
      // reset fields
      setUsername('');
      setEmail('');
      setPassword('');
      setProfilePhotoUrl(null);
      setProfilePhotoId(null);
    } catch (err: any) {
      showNotification('User Register failed', 'error');

      try {
        const parsed = JSON.parse(err?.message);
        const firstError = Object.values(parsed?.issues ?? {})[0] as string[];
        setErrors({ general: firstError?.[0] ?? 'Registration failed' });
      } catch {
        setErrors({ general: err?.message ?? 'Registration failed' });
      }

      // optional: cleanup API call (REST version)
      if (profilePhotoId) {
        try {
          await fetch('/api/imagekit/delete-temp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: profilePhotoId }),
          });
        } catch (e) {
          console.error('cleanup failed', e);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    profilePhotoUrl,
    setProfilePhotoUrl,
    profilePhotoId,
    setProfilePhotoId,
    canSubmit,
    handleSubmit,
    errors,
    setErrors,
    submitting,
  };
}
