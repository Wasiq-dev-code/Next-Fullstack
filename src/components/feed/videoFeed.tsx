'use client';

import VideoInfo from '@/components/feed/VideoInfo';
import { useRandomVideoFeed } from '@/hooks/feed/useRandomVideoFeet';

export default function VideoFeed() {
  const { hasMore, items: videos, loading } = useRandomVideoFeed();

  return (
    <main className="min-h-screen bg-[#171922] px-4 py-8 text-white sm:px-6 lg:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Explore
          </p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Video Feed
          </h1>
          <p className="max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
            Discover amazing content from creators around the world
          </p>
        </div>

        {/* Videos Grid */}
        <div className="space-y-6">
          {videos.map((video) => (
            <div
              key={video._id.toString()}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#20222b] shadow-xl shadow-black/20 transition-shadow duration-300 hover:border-violet-500/30 hover:shadow-violet-950/20"
            >
              <VideoInfo videoObj={video} />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            <p className="font-medium text-gray-400">Loading more videos...</p>
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && !loading && videos.length > 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/15">
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
            <p className="text-lg font-medium text-gray-300">
              You&apos;ve reached the end
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for more videos
            </p>
          </div>
        )}

        {/* Empty State - Initial Load */}
        {!loading && videos.length === 0 && !hasMore && (
          <div className="py-20 text-center">
            <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#20222b] p-8 shadow-xl sm:p-12">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-violet-500/15">
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
              <h3 className="mb-2 text-2xl font-bold text-white">
                No videos available
              </h3>
              <p className="text-gray-400">
                There are no videos to display at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
