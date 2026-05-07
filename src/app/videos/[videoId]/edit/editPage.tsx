'use client';
import UploadExample from '@/components/fileUploads';
import { Input } from '@/components/ui/input';
import useEditVideo from '@/hooks/video/editVideo';
import Image from 'next/image';

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
    <div className="min-h-[calc(100vh-57px)] bg-[#0e0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4">
        <h1 className="text-xl font-bold text-white">Edit Video</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errors._form && (
            <p className="text-red-400 text-sm">{errors._form}</p>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Title</label>
            <Input
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm"
            />
            {errors.title && (
              <p className="text-red-400 text-xs">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full bg-[#1e1f24] border border-white/10 rounded-md text-white placeholder:text-gray-600 text-sm px-3 py-2 resize-none focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
            />
            {errors.description && (
              <p className="text-red-400 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Thumbnail</label>
            {thumbnail?.url && (
              <Image
                src={thumbnail.url}
                alt="Thumbnail"
                width={128}
                height={128}
                className="rounded-md object-cover border border-white/10"
              />
            )}
            <div className="border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-purple-500/50 cursor-pointer transition-colors">
              <UploadExample
                FileType="image"
                visibility="public"
                onSuccess={(res) => {
                  setThumbnail({ url: res.url, fileId: res.fileId });
                  setErrors((p) => ({ ...p, thumbnail: undefined }));
                }}
              />
            </div>
            {thumbnail?.url && (
              <p className="text-green-400 text-xs">Thumbnail uploaded ✔</p>
            )}
            {errors.thumbnail && (
              <p className="text-red-400 text-xs">{errors.thumbnail}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 cursor-pointer text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update Video'}
          </button>
        </form>
      </div>
    </div>
  );
}