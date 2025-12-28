'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import VideoInfo from '@/app/(feed)/components/videos/VideoInfo';

import { ProfileVideoResponse } from '@/lib/types/profile';
import { VideoFeed } from '@/lib/types/video';

const SCROLL_THRESHOLD = 300;

export default function ProfileVideoFeed({ userId }: { userId: string }) {
  const [videos, setVideos] = useState<VideoFeed[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);

  const loadVideos = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const data: ProfileVideoResponse = await apiClient.profileVideos(
        userId,
        cursor,
      );

      if (!data.videos || data.videos.length === 0) {
        setHasMore(false);
        return;
      }

      setVideos((prev) => [...prev, ...data.videos]);
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } catch (error) {
      console.error('Profile videos load failed:', error);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [userId, cursor, hasMore]);

  // Initial load
  useEffect(() => {
    loadVideos();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      const distanceFromBottom =
        document.body.scrollHeight - window.scrollY - window.innerHeight;

      if (distanceFromBottom < SCROLL_THRESHOLD) {
        loadVideos();
      }
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
        <div className="py-6 text-center text-sm text-gray-500">
          Loading videos…
        </div>
      )}

      {!hasMore && !loading && videos.length > 0 && (
        <div className="py-6 text-center text-sm text-gray-400">
          No more videos
        </div>
      )}
    </div>
  );
}
