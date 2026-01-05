'use client';

import { useNotification } from '@/app/components/providers/notification';
import UploadExample from '@/app/components/fileUploads';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

type UploadedFile = {
  url: string;
  fileId: string;
};

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  profilePhoto?: string;
  general?: string;
};

export default function UserRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const { showNotification } = useNotification();

  const canSubmit =
    Boolean(username.trim()) &&
    Boolean(email.trim()) &&
    Boolean(password.trim()) &&
    Boolean(profilePhoto) &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await apiClient.registerUser({
        username,
        email,
        password,
        profilePhoto: {
          url: profilePhoto!.url,
          fileId: profilePhoto!.fileId,
        },
      });

      showNotification(res.message, 'success');

      setUsername('');
      setEmail('');
      setPassword('');
      setProfilePhoto(null);
    } catch (err: any) {
      try {
        const data = await err.json?.();

        if (data?.issues) {
          setErrors({
            username: data.issues.username?.[0],
            email: data.issues.email?.[0],
            password: data.issues.password?.[0],
            profilePhoto: data.issues.profilePhoto?.[0],
          });
          return;
        }

        if (data?.error) {
          setErrors({ general: data.error });
          return;
        }
      } catch {
        setErrors({ general: 'Something went wrong' });
      }

      showNotification('Registration failed', 'error');

      if (!profilePhoto?.fileId) {
        const deletedFile = await fetch(`/api/auth/imageKit-del`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: profilePhoto?.fileId,
        });
        if (deletedFile.ok) {
          showNotification('File deleted on imagekit', 'info');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Register User</h2>

      {errors.general && (
        <p className="text-red-600 text-sm">{errors.general}</p>
      )}

      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setErrors((p) => ({ ...p, username: undefined }));
          }}
          disabled={submitting}
          className="w-full border p-2 rounded"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username}</p>
        )}
      </div>

      <div>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((p) => ({ ...p, email: undefined }));
          }}
          disabled={submitting}
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((p) => ({ ...p, password: undefined }));
          }}
          disabled={submitting}
          className="w-full border p-2 rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      <div>
        <h4 className="font-medium mb-1">Profile Photo</h4>
        <UploadExample
          FileType="image"
          visibility="public"
          onSuccess={(res) => {
            setProfilePhoto({ url: res.url, fileId: res.fileId });
            setErrors((p) => ({ ...p, profilePhoto: undefined }));
          }}
        />
        {profilePhoto && (
          <p className="text-green-600 text-sm">Photo uploaded ✔</p>
        )}
        {errors.profilePhoto && (
          <p className="text-red-500 text-sm">{errors.profilePhoto}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {submitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
