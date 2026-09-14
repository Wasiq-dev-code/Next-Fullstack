'use client';

import CommentsSection from '@/components/videos/comments/CommentSection';
import VideoPlayer from '@/components/feed/videoPlayer';
import { useEffect } from 'react';
import useGetSingleVideo from '@/hooks/video/useGetSingleVideo';
import { SpinnerCustom } from '@/components/ui/spinner';
import VideoNotFound from '@/components/ui/videoNotFound';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoActions } from '@/components/videos/likes/videoAction';
import VideoPlayerWithAi from '@/components/videoPlayer';

export default function SingleVideoPage({ videoId }: { videoId: string }) {
  const { fetchSingleVideo, isliked, likeCount, video, status } =
    useGetSingleVideo({ videoId });

  useEffect(() => {
    fetchSingleVideo();
  }, [fetchSingleVideo]);

  if (status === 'loading') {
    return <SpinnerCustom />;
  }

  if (status === 'not-found') {
    return <VideoNotFound />;
  }

  if (!video) {
    return <SpinnerCustom />;
  }

  return (
    <main className="min-h-screen bg-[#171922] py-6 sm:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6">
        <Card className="overflow-hidden border-white/10 bg-[#20222b] shadow-2xl shadow-black/30">
          <VideoPlayer video={video} />
          <CardContent className="flex justify-end border-t border-white/10 px-5 py-4 sm:px-8">
            <VideoActions
              isLiked={isliked}
              likeCount={likeCount}
              videoId={video._id}
            />
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-white/10 bg-[#20222b] p-4 shadow-2xl shadow-black/20 sm:p-5">
          <VideoPlayerWithAi videoSrc={video.video.url} />
        </div>

        <Card className="border-white/10 bg-[#20222b] text-white shadow-2xl shadow-black/20">
          <CardHeader className="border-b border-white/10 px-5 py-5 sm:px-8">
            <CardTitle className="text-xl font-semibold text-white">
              Comments
            </CardTitle>
            <p className="text-sm text-gray-400">
              Join the conversation about this video.
            </p>
          </CardHeader>
          <CardContent className="px-5 py-6 sm:px-8">
            <CommentsSection key={videoId} videoId={videoId} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
