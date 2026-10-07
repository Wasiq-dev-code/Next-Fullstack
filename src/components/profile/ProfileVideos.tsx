'use client';

import VideoInfo from '@/components/feed/VideoInfo';
import { useProfileVideos } from '@/hooks/profile/useProfileVideos';

export default function ProfileVideos({ userId }: { userId: string }) {
  const { hasMore, items: videos, loading } = useProfileVideos(userId);

  return (
    <section style={{ marginTop: 32 }}>
      <div
        className="flex items-center justify-between border-b border-white/10"
        style={{ paddingBottom: 12, marginBottom: 24 }}
      >
        <h2 className="text-lg font-semibold text-white">Videos</h2>
        <span className="text-sm text-slate-500">Latest uploads</span>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoInfo key={video._id} videoObj={video} />
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center py-10">
          <div className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading videos...</p>
        </div>
      )}

      {!loading && videos.length === 0 && !hasMore && (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <h3 className="text-lg font-semibold text-white">No videos yet</h3>
          <p className="mt-1 text-sm text-gray-400">
            This profile hasn&apos;t posted any videos.
          </p>
        </div>
      )}
    </section>
  );
}