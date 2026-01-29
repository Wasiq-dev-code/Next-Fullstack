'use client';

import VideoInfo from '@/components/feed/VideoInfo';

import { useProfileVideos } from '@/hooks/profile/useProfileVideos';

export default function ProfileVideoFeed({ userId }: { userId: string }) {
  const { hasMore, items: videos, loading } = useProfileVideos(userId);
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Videos Grid */}
        <div className="space-y-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <VideoInfo videoObj={video} />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading videos…</p>
          </div>
        )}

        {/* No More Videos */}
        {!hasMore && !loading && videos.length > 0 && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-slate-200 to-slate-300 rounded-full mb-4">
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
            <p className="text-slate-500 font-medium text-lg">
              Youve reached the end
            </p>
            <p className="text-slate-400 text-sm mt-1">
              No more videos to load
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && !hasMore && (
          <div className="py-20 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
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
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                No videos yet
              </h3>
              <p className="text-slate-500">
                This profile hasnt posted any videos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
