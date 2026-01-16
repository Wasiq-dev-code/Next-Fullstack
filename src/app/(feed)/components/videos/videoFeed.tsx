'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/src/lib/api-client';
import { useNotification } from '../../../components/providers/notification';
import type {
  FeedRequest,
  FeedResponse,
  VideoFeed as VideoFeedType,
} from '@/src/types/video';
import VideoInfo from './VideoInfo';

const SCROLL_THRESHOLD = 300;
const MAX_EXCLUDE = 100;

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoFeedType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number>(0);

  const { showNotification } = useNotification();

  // Guard against parallel calls
  const fetchingRef = useRef(false);

  const loadVideos = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    const payload: FeedRequest = {
      cursor,
      excludeIds: videos.slice(-MAX_EXCLUDE).map((v) => v._id),
    };

    try {
      const data: FeedResponse = await apiClient.fetchRandomFeed(payload);

      if (!data.videos || data.videos.length === 0) {
        setHasMore(false);
        return;
      }

      setVideos((prev) => {
        const map = new Map(prev.map((v) => [v._id.toString(), v]));
        [...prev, ...data.videos].forEach((v) => {
          map.set(v._id.toString(), v);
        });
        return Array.from(map.values());
      });

      if (data.nextCursor !== null) {
        setCursor(data.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Feed load failed:', error);
      showNotification('Failed to load videos', 'error');
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [cursor, videos, hasMore, showNotification]);

  // Initial load
  useEffect(() => {
    loadVideos();
  }, []);

  // Throttled scroll handler
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const distanceFromBottom =
          document.body.scrollHeight - window.scrollY - window.innerHeight;

        if (distanceFromBottom < SCROLL_THRESHOLD) {
          loadVideos();
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadVideos]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Video Feed</h1>
          <p className="text-slate-600">
            Discover amazing content from creators around the world
          </p>
        </div>

        {/* Videos Grid */}
        <div className="space-y-6">
          {videos.map((video) => (
            <div
              key={video._id.toString()}
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
            <p className="text-slate-600 font-medium">Loading more videos…</p>
          </div>
        )}

        {/* End of Feed */}
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
              Check back later for more videos
            </p>
          </div>
        )}

        {/* Empty State - Initial Load */}
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
                No videos available
              </h3>
              <p className="text-slate-500">
                There are no videos to display at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
