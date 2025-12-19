'use client';
import { useCallback, useEffect, useState } from 'react';
import { useNotification } from './notification';
import { apiClient } from '@/lib/api-client';
import type { FeedRequest, FeedResponse, VideoFeed } from '@/lib/types/result';

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoFeed[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cursor, setCursor] = useState<number | null>(0);

  const loadVideos = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const payload: FeedRequest = {
      cursor: cursor,
      excludeIds: videos.slice(-100).map((v) => v._id),
    };
    try {
      const data: FeedResponse = await apiClient.fetchRandomFeed(payload);

      if (data.videos && data.videos.length > 0) {
        setVideos((prev) => [...prev, ...data.videos]);
        setCursor(data.nextCursor || cursor);
        setHasMore(data.nextCursor !== null);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  }, [videos, loading, hasMore, cursor]);

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
        <div key={video._id}>{/* Render video */}</div>
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
