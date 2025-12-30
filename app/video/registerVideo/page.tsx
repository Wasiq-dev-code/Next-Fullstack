'use client';

import UploadExample from '@/app/components/fileUploads';
import { useNotification } from '@/app/components/providers/notification';
import { useRegisterVideo } from '../hooks/common/useRegisterVideo';

export default function RegisterVideo() {
  const { showNotification } = useNotification();

  const {
    title,
    description,
    errors,
    submitting,
    canSubmit,
    setTitle,
    setDescription,
    setVideo,
    setThumbnail,
    submit,
  } = useRegisterVideo(showNotification);

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
          onSuccess={(res) => setThumbnail(res)}
        />
        {errors.thumbnail && <p style={{ color: 'red' }}>{errors.thumbnail}</p>}
      </div>

      {/* Video */}
      <div>
        <h4>Video</h4>
        <UploadExample
          FileType="video"
          visibility="private"
          onSuccess={(res) => setVideo(res)}
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
