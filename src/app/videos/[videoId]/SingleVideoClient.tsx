'use client';

import CommentsSection from '@/components/videos/comments/CommentSection';
import VideoPlayer from '@/components/feed/videoPlayer';
import { useEffect } from 'react';
import useGetSingleVideo from '@/hooks/video/useGetSingleVideo';
import { SpinnerCustom } from '@/components/ui/spinner';
import VideoNotFound from '@/components/ui/videoNotFound';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VideoActions } from '@/components/videos/likes/videoAction';

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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Video Player Section */}
        <Card className="mb-6 overflow-hidden">
          {/* Video */}
          <div className="aspect-video bg-black">
            <VideoPlayer video={video} />
          </div>

          <CardContent className="space-y-4 p-6">
            <CardTitle className="text-3xl">{video.title}</CardTitle>

            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Stats */}
              <div className="flex items-center gap-6 text-muted-foreground">
                <span>24.5K views</span>
                <span>{video.uploadedAt}</span>
              </div>

              {/* Actions */}
              <VideoActions
                isLiked={isliked}
                likeCount={likeCount}
                videoId={video._id}
              />
            </div>

            {video.description && (
              <>
                <Separator />
                <p className="text-muted-foreground">{video.description}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="bg-black rounded-3xl shadow-xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>

            <CardContent>
              <CommentsSection key={videoId} videoId={videoId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
