'use client';

import VideoInfo from '@/components/feed/VideoInfo';
import { useSearchVideos } from '@/hooks/searchBar/useSearchVideos';

export default function SearchResults({ query }: { query: string }) {
  const { items: videos, loading, hasMore } = useSearchVideos(query);

  return (
    <main className="min-h-screen bg-[#171922] px-4 py-8 text-white sm:px-6">
      {/* Widened from max-w-5xl so 3-4 columns fit */}
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Search
          </p>
          <h1 className="text-3xl font-bold">
            Results for &ldquo;{query}&rdquo;
          </h1>
        </div>

        {/* Results grid: 1 col mobile, 2 tablet, 3 laptop, 4 large screens */}
        <div className="grid grid-cols-1 items-start gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {videos.map((video) => (
            <div
              key={video._id.toString()}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#20222b] transition-shadow duration-300 hover:border-violet-500/30"
            >
              <VideoInfo videoObj={video} />
            </div>
          ))}
        </div>

        {loading && (
          <p className="py-12 text-center text-gray-400">Searching...</p>
        )}

        {!loading && videos.length === 0 && !hasMore && (
          <p className="py-20 text-center text-gray-400">
            No videos found for &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </main>
  );
}