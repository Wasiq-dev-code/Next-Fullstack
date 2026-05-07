'use client';

import { useState } from 'react';
import { useNotification } from '@/components/notification';
import { apiClient } from '@/lib/Api-client/api-client';
import { rollbackDelete } from '@/lib/videofallback/rollBackDelete';
import { UploadedFile } from '@/types/file';
import { CreateVideoDTO } from '@/types/video';

type FormState = {
  title: string;
  description: string;
  thumbnail: UploadedFile | null;
  video: UploadedFile | null;
};

type Errors = Partial<Record<keyof FormState, string>>;

export function useRegisterVideo() {
  const [form, setForm] = useState<CreateVideoDTO>({
    title: '',
    description: '',
    thumbnail: { url: '', fileId: '' },
    video: { url: '', fileId: '' },
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const { showNotification } = useNotification();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined })); // clear on change
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.thumbnail.url) e.thumbnail = 'Thumbnail is required';
    if (!form.video.url) e.video = 'Video is required';
    return e;
  };

  const canSubmit =
    Boolean(form.title.trim()) &&
    Boolean(form.description.trim()) &&
    Boolean(form.thumbnail) &&
    Boolean(form.video) &&
    !submitting;

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.createVideo(form);
      showNotification('Video uploaded successfully', 'success');
      setForm({
        title: '',
        description: '',
        thumbnail: { url: '', fileId: '' },
        video: { url: '', fileId: '' },
      });
    } catch (err) {
      // Rollback uploaded files
      await Promise.allSettled([
        form.thumbnail && rollbackDelete(form.thumbnail.fileId),
        form.video && rollbackDelete(form.video.fileId),
      ]);
      showNotification('Video upload failed', 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return { form, errors, submitting, canSubmit, setField, submit };
}
