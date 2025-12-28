'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useNotification } from '../../../components/providers/notification';
import type { FeedRequest, FeedResponse, VideoFeed } from '@/lib/types/video';
import VideoInfo from './VideoInfo';

const SCROLL_THRESHOLD = 300;
const MAX_EXCLUDE = 100;

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoFeed[]>([]);
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

      setVideos((prev) => [...prev, ...data.videos]);

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
    <div>
      {videos.map((video) => (
        <VideoInfo key={video._id} videoObj={video} />
      ))}

      {loading && (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading more videos…
        </div>
      )}

      {!hasMore && !loading && videos.length > 0 && (
        <div className="py-10 text-center text-sm text-gray-400">
          You, ve reached the end
        </div>
      )}
    </div>
  );
}
