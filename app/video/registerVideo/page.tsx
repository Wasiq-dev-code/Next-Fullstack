'use client';
import UploadExample from '@/app/components/fileUploads';
import { useNotification } from '@/app/components/providers/notification';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';

export type UploadedFile = {
  url: string;
  fileId: string;
};

export default function RegisterVideo() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [thumbnail, setThumbnail] = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { showNotification } = useNotification();

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(description.trim()) &&
    Boolean(video) &&
    Boolean(thumbnail) &&
    !submitting;

  const rollbackDelete = async (fileId: string) => {
    try {
      await fetch(`/api/auth/imageKit-del/${fileId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Rollback delete failed:', err);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const dataObj = await apiClient.createVideo({
        title: title.trim(),
        description: description.trim(),
        thumbnail: {
          url: thumbnail!.url,
          fileId: thumbnail!.fileId,
        },
        video: {
          url: video!.url,
          fileId: video!.fileId,
        },
      });
      if (!dataObj?.message) throw new Error('Invalid API response');

      showNotification(dataObj.message, 'success');

      setTitle('');
      setDescription('');
      setThumbnail(null);
      setVideo(null);
    } catch (err) {
      showNotification('Error Registering Video', 'error');

      if (!thumbnail?.fileId) await rollbackDelete(thumbnail!.fileId);
      if (!video?.fileId) await rollbackDelete(video!.fileId);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div>
      <h2>Create Video</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <h4>Thumbnail</h4>
        <UploadExample
          FileType="image"
          visibility="private"
          onSuccess={(res) => setThumbnail(res)}
        />
        {thumbnail && <p>Thumbnail uploaded ✔</p>}
      </div>

      <div>
        <h4>Video</h4>
        <UploadExample
          FileType="video"
          visibility="private"
          onSuccess={(res: UploadedFile) => setVideo(res)}
        />
        {video && <p>Video uploaded ✔</p>}
      </div>
      <button disabled={!canSubmit} onClick={handleSubmit}>
        {submitting ? 'Creating...' : 'Create Video'}
      </button>
    </div>
  );
}
