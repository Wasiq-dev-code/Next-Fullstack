'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotification } from '../../../components/providers/notification';
import { apiClient } from '@/lib/api-client';
import type { FeedRequest, FeedResponse, VideoFeed } from '@/lib/types/video';
import VideoInfo from './VideoInfo';

type stateType = {
  loading: boolean | null;
  hasMore: boolean;
  cursor: number;
};

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoFeed[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cursor, setCursor] = useState<number | null>(0);
  const { showNotification } = useNotification();
  const stateRef = useRef<stateType>({
    loading: false,
    hasMore: true,
    cursor: 0,
  });

  const loadVideos = useCallback(async () => {
    const state = stateRef.current;
    if (state.loading || !state.hasMore) return;

    state.loading = true;
    setLoading(true);
    const payload: FeedRequest = {
      cursor: state.cursor,
      excludeIds: videos.slice(-100).map((v) => v._id),
    };
    try {
      const data: FeedResponse = await apiClient.fetchRandomFeed(payload);

      if (data.videos && data.videos.length > 0) {
        setVideos((prev) => [...prev, ...data.videos]);
        state.cursor = data.nextCursor || state.cursor;
        setCursor(state.cursor);
        state.hasMore = data.nextCursor !== null;
        setHasMore(state.hasMore);
        showNotification('Videos loaded', 'success');
      } else {
        state.hasMore = false;
        setHasMore(false);
        showNotification('No more videos', 'info');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      showNotification('Failed to load videos', 'error');
    } finally {
      state.loading = false;
      setLoading(false);
    }
  }, [videos, showNotification]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;

      const fullHeight = document.body.scrollHeight;

      const windowHeight = window.innerHeight;

      const distanceFromBottom = fullHeight - scrollTop - windowHeight;

      if (distanceFromBottom < 300) {
        loadVideos();
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadVideos]);

  return (
    <div>
      {videos.map((video) => (
        <VideoInfo key={video._id} videoObj={video} />
      ))}
      {loading && (
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      )}

      {!hasMore && !loading && (
        <div className="text-center py-8">
          <p>No more videos</p>
        </div>
      )}
    </div>
  );
}
