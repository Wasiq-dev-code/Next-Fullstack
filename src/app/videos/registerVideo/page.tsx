'use client';

import UploadExample from '@/components/fileUploads';
import { useRegisterVideo } from '@/hooks/video/useRegisterVideo';
import { useDispatch } from 'react-redux';
import { setThumbnail, setVideo } from '@/store/slice/videoUpload.slice';
import { AppDispatch } from '@/store/store';

export default function RegisterVideo() {
  const {
    title,
    description,
    errors,
    submitting,
    canSubmit,
    setTitle,
    setErrors,
    setDescription,
    submit,
  } = useRegisterVideo();

  const dispatch = useDispatch<AppDispatch>();

  return (
    <div>
      <h2>Create Video</h2>

      {/* Title */}
      <div>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p style={{ color: 'red' }}>{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p style={{ color: 'red' }}>{errors.description}</p>
        )}
      </div>

      {/* Thumbnail */}
      <div>
        <h4>Thumbnail</h4>
        <UploadExample
          FileType="image"
          visibility="private"
          onSuccess={(res) => {
            dispatch(setThumbnail(res));
            setErrors((prev) => ({ ...prev, thumbnail: undefined }));
          }}
        />
        {errors.thumbnail && <p style={{ color: 'red' }}>{errors.thumbnail}</p>}
      </div>

      {/* Video */}
      <div>
        <h4>Video</h4>
        <UploadExample
          FileType="video"
          visibility="private"
          onSuccess={(res) => {
            dispatch(setVideo(res));
            setErrors((prev) => ({ ...prev, video: undefined }));
          }}
        />
        {errors.video && <p style={{ color: 'red' }}>{errors.video}</p>}
      </div>

      {/* Submit */}
      <button disabled={!canSubmit} onClick={submit}>
        {submitting ? 'Creating...' : 'Create Video'}
      </button>
    </div>
  );
}
