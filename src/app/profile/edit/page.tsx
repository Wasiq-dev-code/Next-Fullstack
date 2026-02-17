'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/Api-client/api-client';
import { useNotification } from '@/components/providers/notification';
import UploadExample from '@/components/fileUploads';
import { rollbackDelete } from '@/lib/videofallback/rollBackDelete';

type UploadedFile = {
  url: string;
  fileId: string;
};

type ErrorFields = {
  username?: string;
  email?: string;
  profilePhoto?: string;
  _form?: string;
};

export default function ChangeProfileFields() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<UploadedFile | null>(null);

  const [errors, setErrors] = useState<ErrorFields>({});
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrors({});
    setLoading(true);

    try {
      const payload: Record<string, any> = {};

      if (username.trim()) payload.username = username.trim();
      if (email.trim()) payload.email = email.trim();
      if (profilePhoto) payload.profilePhoto = profilePhoto;

      if (!username.trim() && !email.trim() && !profilePhoto) {
        setErrors({ _form: 'Nothing to update' });
        setLoading(false);
        return;
      }

      const res = await apiClient.changeFields(payload);

      showNotification(res.message, 'success');

      setUsername('');
      setEmail('');
    } catch (err: any) {
      const res = err?.response;

      // Zod validation errors
      if (res?.status === 400 && res.data?.issues) {
        setErrors(res.data.issues);
        return;
      }

      // Email conflict
      if (res?.status === 409) {
        setErrors({ email: 'Email already in use' });
        return;
      }

      // Fallback
      setErrors({ _form: 'Something went wrong' });
      showNotification('Failed to update profile', 'error');

      // If profilePhoto issue? will delete image from imagekit
      if (profilePhoto?.fileId) {
        await rollbackDelete(profilePhoto.fileId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Edit Profile</h2>

      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className="input"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username}</p>
        )}
      </div>

      <div>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="input"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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

      {errors._form && <p className="text-sm text-red-500">{errors._form}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
