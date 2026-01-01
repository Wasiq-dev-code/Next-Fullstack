'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useNotification } from '@/app/components/providers/notification';
import UploadExample from '@/app/components/fileUploads';
import { rollbackDelete } from '@/lib/rollBackDelete';

type UploadedFile = {
  url: string;
  fileId: string;
};

type ErrorFields = {
  title?: string;
  description?: string;
  thumbnail?: string;
  _form?: string;
};

export default function ChangeVideoFields() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<UploadedFile | null>(null);

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

      if (title.trim()) payload.title = title.trim();
      if (description.trim()) payload.description = description.trim();
      if (thumbnail) payload.thumbnail = thumbnail;

      if (!title.trim() && !description.trim() && !thumbnail) {
        setErrors({ _form: 'Nothing to update' });
        setLoading(false);
        return;
      }

      const res = await apiClient.changeFields(payload);

      showNotification(res.message, 'success');

      setTitle('');
      setDescription('');
    } catch (err: any) {
      const res = err?.response;

      // Zod validation errors
      if (res?.status === 400 && res.data?.issues) {
        setErrors(res.data.issues);
        return;
      }

      // description conflict
      if (res?.status === 409) {
        setErrors({ description: 'description already in use' });
        return;
      }

      // Fallback
      setErrors({ _form: 'Something went wrong' });
      showNotification('Failed to update profile', 'error');

      // If thumbnail issue? will delete image from imagekit
      if (thumbnail?.fileId) {
        await rollbackDelete(thumbnail.fileId);
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
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="input"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <input
          placeholder="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="input"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <h4 className="font-medium mb-1">Profile Photo</h4>
        <UploadExample
          FileType="image"
          visibility="public"
          onSuccess={(res) => {
            setThumbnail({ url: res.url, fileId: res.fileId });
            setErrors((p) => ({ ...p, thumbnail: undefined }));
          }}
        />
        {thumbnail && (
          <p className="text-green-600 text-sm">Photo uploaded ✔</p>
        )}
        {errors.thumbnail && (
          <p className="text-red-500 text-sm">{errors.thumbnail}</p>
        )}
      </div>

      {errors._form && <p className="text-sm text-red-500">{errors._form}</p>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
