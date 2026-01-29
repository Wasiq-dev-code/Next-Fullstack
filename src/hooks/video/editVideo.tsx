'use client';

import { rollbackDelete } from '@/lib/rollBackDelete';
import { UploadedFile } from '@/types/file';
import { useState, useEffect } from 'react';
import { useNotification } from '@/components/providers/notification';
import { apiClient } from '@/lib/api-client';
import { SingleVideoRes } from '@/types/video';

type ErrorFields = {
  title?: string;
  description?: string;
  thumbnail?: string;
  _form?: string;
};

type UploadThumbnail = {
  url: string | null;
};

export default function useEditVideo({ videoId }: { videoId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<
    UploadedFile | UploadThumbnail | null
  >(null);

  const [errors, setErrors] = useState<ErrorFields>({});
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!videoId) return;

    async function load() {
      const res: SingleVideoRes = await apiClient.fetchSingleVideo(videoId);

      setTitle(res.data.singleVideo.title);
      setDescription(res.data.singleVideo.description);
      setThumbnail({ url: res.data.singleVideo.thumbnail?.url }); // { url, fileId }
    }

    load();
  }, [videoId]);

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
      setThumbnail(null);
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
      if (thumbnail && 'fileId' in thumbnail && thumbnail.fileId) {
        await rollbackDelete(thumbnail.fileId);
      }
    } finally {
      setLoading(false);
    }
  };
  return {
    handleSubmit,
    errors,
    title,
    loading,
    setTitle,
    description,
    setDescription,
    setThumbnail,
    setErrors,
    thumbnail,
  };
}
