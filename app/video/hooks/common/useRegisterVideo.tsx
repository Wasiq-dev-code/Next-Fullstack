import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { rollbackDelete } from '@/lib/rollBackDelete';

type UploadedFile = {
  url: string;
  fileId: string;
};

type ShowNotification = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
) => void;

type Errors = {
  title?: string;
  description?: string;
  video?: string;
  thumbnail?: string;
};

export function useRegisterVideo(showNotification: ShowNotification) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [thumbnail, setThumbnail] = useState<UploadedFile | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(description.trim()) &&
    Boolean(video) &&
    Boolean(thumbnail) &&
    !submitting;

  const validate = () => {
    const e: Errors = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!thumbnail) e.thumbnail = 'Thumbnail is required';
    if (!video) e.video = 'Video is required';
    return e;
  };

  const submit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const res = await apiClient.createVideo({
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail!,
        video: video!,
      });

      showNotification(res.message, 'success');

      setTitle('');
      setDescription('');
      setVideo(null);
      setThumbnail(null);
    } catch (err) {
      console.error(err);
      showNotification('Error Registering Video', 'error');

      if (thumbnail?.fileId) rollbackDelete(thumbnail.fileId);
      if (video?.fileId) rollbackDelete(video.fileId);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title,
    description,
    video,
    thumbnail,
    errors,
    submitting,
    canSubmit,
    setTitle,
    setDescription,
    setVideo,
    setThumbnail,
    submit,
  };
}
