'use client';

import CommentsSection from '@/app/video/components/CommentSection';
import ToggleLikeOnVideo from '@/app/video/components/ToggleLikeOnVideo';
import VideoPlayer from '@/app/(feed)/components/videos/videoPlayer';
import { apiClient } from '@/lib/api-client';
import { SingleVideoRes, VideoDetails } from '@/lib/types/video';
import { useCallback, useEffect, useState } from 'react';

export default function SingleVideoPage({
  params,
}: {
  params: { videoId: string };
}) {
  const { videoId } = params;
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isliked, setIsLiked] = useState<boolean>(false);

  const fetchSingleVideo = useCallback(async () => {
    setLoading(true);
    try {
      const res: SingleVideoRes = await apiClient.fetchSingleVideo(videoId);
      setVideo(res.data.singleVideo);
      setLikeCount(res.data.likeCount);
      setIsLiked(res.data.isLiked);
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
      <ToggleLikeOnVideo
        videoId={video._id}
        initialLikes={likeCount}
        initialLiked={isliked}
      ></ToggleLikeOnVideo>
      <CommentsSection videoId={video._id} />
    </>
  );
}
