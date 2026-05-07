'use client';

import UploadExample from '@/components/fileUploads';
import { Input } from '@/components/ui/input';
import { useRegisterVideo } from '@/hooks/video/useRegisterVideo';

export default function RegisterVideo() {
  const { form, errors, submitting, canSubmit, setField, submit } =
    useRegisterVideo();

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#0e0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4">
        <h1 className="text-xl font-bold text-white">Upload Video</h1>

        <div className="space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Title</label>
            <Input
              placeholder="e.g. My Awesome Video"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              disabled={submitting}
              className="bg-[#1e1f24]  text-white placeholder:text-gray-600 text-sm focus-visible:ring-purple-500"
            />
            {errors.title && (
              <p className="text-red-400 text-xs">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              placeholder="Tell us about your video..."
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              disabled={submitting}
              rows={3}
              className="w-full bg-[#1e1f24] border border-white/10 rounded-md text-white placeholder:text-gray-600 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {errors.description && (
              <p className="text-red-400 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Thumbnail</label>
            <div className="border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-purple-500/50 cursor-pointer transition-colors">
              <UploadExample
                FileType="image"
                visibility="private"
                onSuccess={(res) =>
                  setField('thumbnail', { url: res.url, fileId: res.fileId })
                }
              />
            </div>
            {form.thumbnail.url && (
              <p className="text-green-400 text-xs">Thumbnail uploaded ✔</p>
            )}
            {errors.thumbnail && (
              <p className="text-red-400 text-xs">{errors.thumbnail}</p>
            )}
          </div>

          {/* Video */}
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Video</label>
            <div className="border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-purple-500/50 cursor-pointer transition-colors">
              <UploadExample
                FileType="video"
                visibility="private"
                onSuccess={(res) =>
                  setField('video', { url: res.url, fileId: res.fileId })
                }
              />
            </div>
            {form.video.url && (
              <p className="text-green-400 text-xs">Video uploaded ✔</p>
            )}
            {errors.video && (
              <p className="text-red-400 text-xs">{errors.video}</p>
            )}
          </div>

          {/* Submit */}
          <button
            disabled={!canSubmit}
            onClick={submit}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 cursor-pointer text-white font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </div>
    </div>
  );
}
