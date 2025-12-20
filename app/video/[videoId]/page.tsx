'use client';

import CommentsSection from '@/app/comments/videoComments/[videoId]/page';
import VideoPlayer from '@/app/components/videos/videoPlayer';
import { apiClient } from '@/lib/api-client';
import { VideoDetails } from '@/lib/types/video';
import { useCallback, useEffect, useState } from 'react';

export default function SingleVideoPage({
  params,
}: {
  params: { videoId: string };
}) {
  const { videoId } = params;
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoDetails | null>(null);

  const fetchSingleVideo = useCallback(async () => {
    setLoading(true);
    try {
      const singleVideo: VideoDetails =
        await apiClient.fetchSingleVideo(videoId);
      setVideo(singleVideo);
    } catch (error) {
      console.error('Error while fetching singleVideo', error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchSingleVideo();
  }, [fetchSingleVideo]);

  if (loading) return <p>Loading...</p>;
  if (!video) return <p>Video not found</p>;
  return (
    <>
      <VideoPlayer video={video} />
      <CommentsSection videoId={video._id} />
    </>
  );
}
