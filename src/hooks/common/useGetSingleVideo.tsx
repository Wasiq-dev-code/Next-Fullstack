'use client';

import { apiClient } from '@/lib/api-client';
import { SingleVideoRes, VideoDetails } from '@/types/video';
import { useCallback, useState } from 'react';
type Status = 'idle' | 'loading' | 'success' | 'not-found';

export default function useGetSingleVideo({ videoId }: { videoId: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isliked, setIsLiked] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>('loading');

  const fetchSingleVideo = useCallback(async () => {
    setLoading(true);
    try {
      const res: SingleVideoRes = await apiClient.fetchSingleVideo(videoId);

      if (!res?.data.singleVideo) {
        setVideo(null);
        setStatus('not-found');
        return;
      }

      setVideo(res.data.singleVideo);
      setLikeCount(res.data.likeCount);
      setIsLiked(res.data.isLiked);
      setStatus('success');
    } catch (error) {
      console.error('Error while fetching singleVideo', error);
      setVideo(null);
      setStatus('not-found');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  return {
    fetchSingleVideo,
    isliked,
    likeCount,
    video,
    loading,
    status,
  };
}
