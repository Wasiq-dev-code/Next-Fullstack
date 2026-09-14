'use client';

import VideoInfo from '@/components/feed/VideoInfo';

import { useProfileVideos } from '@/hooks/profile/useProfileVideos';

export default function ProfileVideoFeed({ userId }: { userId: string }) {
  const { hasMore, items: videos, loading } = useProfileVideos(userId);
  return (
    <section className="bg-[#171922] px-4 pb-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-semibold text-white">Videos</h2>
          <span className="text-xs text-gray-500 sm:text-sm">Latest uploads</span>
        </div>
        {/* Videos Grid */}
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video._id}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#20222b] shadow-lg shadow-black/20 transition-shadow duration-300 hover:border-violet-500/30"
            >
              <VideoInfo videoObj={video} />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-3 h-9 w-9 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            <p className="font-medium text-gray-400">Loading videos...</p>
          </div>
        )}

        {/* No More Videos */}
        {!hasMore && !loading && videos.length > 0 && (
          <div className="py-10 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/15">
              <svg
                className="w-8 h-8 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-400">
              You&apos;ve reached the end
            </p>
            <p className="mt-1 text-sm text-gray-500">
              No more videos to load
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && !hasMore && (
          <div className="py-14 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#20222b] p-7 shadow-xl sm:p-9">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/15">
                <svg
                  className="w-12 h-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">
                No videos yet
              </h3>
              <p className="text-gray-400">
                This profile hasn&apos;t posted any videos.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
