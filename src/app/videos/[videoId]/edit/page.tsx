'use client';

import { useNotification } from '@/components/providers/notification';
import UploadExample from '@/components/fileUploads';
import useEditVideo from '@/hooks/common/editVideo';

export default function ChangeVideoFields({ videoId }: { videoId: string }) {
  const {
    description,
    errors,
    handleSubmit,
    loading,
    setDescription,
    setErrors,
    setThumbnail,
    setTitle,
    thumbnail,
    title,
  } = useEditVideo({ videoId });

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
