'use client';

import { useNotification } from '@/app/components/providers/notification';
import UploadExample from '@/app/components/fileUploads';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { Router } from 'next/router';

type UploadedFile = {
  url: string;
  fileId: string;
};

export default function UserRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { showNotification } = useNotification();

  const canSubmit =
    Boolean(username.trim()) &&
    Boolean(email.trim()) &&
    Boolean(password.trim()) &&
    Boolean(profilePhoto) &&
    !submitting;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent default form submission

    console.log('🔵 Submit clicked', { canSubmit, submitting });

    if (!canSubmit || submitting) {
      console.log('❌ Submit blocked', { canSubmit, submitting });
      return;
    }

    setSubmitting(true);

    try {
      console.log('🚀 Calling registerUser API...', {
        username,
        email,
        profilePhoto,
      });

      const res = await apiClient.registerUser({
        username,
        email,
        password,
        profilePhoto: {
          url: profilePhoto!.url,
          fileId: profilePhoto!.fileId,
        },
      });

      console.log('✅ Registration response:', res);

      if (!res) throw new Error('No response');

      showNotification(res.message, 'success');

      // reset
      setUsername('');
      setEmail('');
      setPassword('');
      setProfilePhoto(null);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      showNotification('Failed to register user', 'error');

      if (profilePhoto?.fileId) {
        try {
          console.log('🗑️ Deleting photo:', profilePhoto.fileId);
          await fetch('/api/auth/imageKit-del', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: profilePhoto.fileId }),
          });
          console.log('✅ Photo deleted');
        } catch (e) {
          console.error('❌ Delete failed:', e);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <h2>Register User</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={submitting}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={submitting}
      />

      <div>
        <h4>Profile Photo</h4>
        <UploadExample
          FileType="image"
          visibility="public"
          onSuccess={(res) => {
            console.log('📸 Photo uploaded:', res);
            setProfilePhoto({ url: res.url, fileId: res.fileId });
          }}
        />
        {profilePhoto && <p>Profile photo uploaded ✔</p>}
      </div>

      <button type="submit" disabled={!canSubmit}>
        {submitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
