import { useState } from 'react';
import { useNotification } from '@/components/providers/notification';
import { AppDispatch, RootState } from '@/src/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { createVideoThunk } from '@/src/store/thunks/videoUpload.thunk';

type Errors = {
  title?: string;
  description?: string;
  video?: string;
  thumbnail?: string;
};

export function useRegisterVideo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const { showNotification } = useNotification();

  const dispatch: AppDispatch = useDispatch();
  const { submitting, thumbnail, video } = useSelector(
    (state: RootState) => state.registerVideo,
  );

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail || !video || !title || !description) {
      setErrors(validate());
      return;
    }
    setErrors({});

    try {
      await dispatch(createVideoThunk({ title, description })).unwrap();
      showNotification('Video uploaded Successfully', 'success');

      setTitle('');
      setDescription('');
    } catch (err) {
      showNotification('Video upload failed', 'error');
      console.error(err);
    }
  };

  return {
    title,
    description,
    video,
    thumbnail,
    errors,
    setErrors,
    submitting,
    canSubmit,
    setTitle,
    setDescription,
    submit,
  };
}
