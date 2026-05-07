'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/Api-client/api-client';
import { useNotification } from '@/components/notification';
import UploadExample from '@/components/fileUploads';
import { rollbackDelete } from '@/lib/videofallback/rollBackDelete';
import { EditProfileFields } from '@/types/result';
import { Input } from '@/components/ui/input';

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

      const res = await apiClient.changeProfileFields(
        payload as EditProfileFields,
      );
      showNotification(res.message, 'success');
      setUsername('');
      setEmail('');
    } catch (err: any) {
      const res = err?.response;

      if (res?.status === 400 && res.data?.issues) {
        setErrors(res.data.issues);
        return;
      }
      if (res?.status === 409) {
        setErrors({ email: 'Email already in use' });
        return;
      }

      setErrors({ _form: 'Something went wrong' });
      showNotification('Failed to update profile', 'error');

      if (profilePhoto?.fileId) {
        await rollbackDelete(profilePhoto.fileId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#0e0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4">
        <h1 className="text-xl font-bold text-white">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errors._form && (
            <p className="text-red-400 text-sm">{errors._form}</p>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Username</label>
            <Input
              placeholder="e.g. cooluser99"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((p) => ({ ...p, username: undefined }));
              }}
              disabled={loading}
              className="bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm"
            />
            {errors.username && (
              <p className="text-red-400 text-xs">{errors.username}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Email address</label>
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              disabled={loading}
              className="bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Profile photo</label>
            <div className="border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-purple-500/50 cursor-pointer transition-colors">
              <UploadExample
                FileType="image"
                visibility="public"
                onSuccess={(res) => {
                  setProfilePhoto({ url: res.url, fileId: res.fileId });
                  setErrors((p) => ({ ...p, profilePhoto: undefined }));
                }}
              />
            </div>
            {profilePhoto && (
              <p className="text-green-400 text-xs">Photo uploaded ✔</p>
            )}
            {errors.profilePhoto && (
              <p className="text-red-400 text-xs">{errors.profilePhoto}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 cursor-pointer text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
