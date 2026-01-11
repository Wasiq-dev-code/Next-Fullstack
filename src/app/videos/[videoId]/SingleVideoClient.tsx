'use client';

import CommentsSection from '@/src/app/videos/components/comments/CommentSection';
import VideoPlayer from '@/src/app/(feed)/components/videos/videoPlayer';
import { apiClient } from '@/src/lib/api-client';
import { SingleVideoRes, VideoDetails } from '@/src/lib/types/video';
import { useCallback, useEffect, useState } from 'react';
import { LikeButton } from '../components/likes/LikeButton';
import { LikeVideoResponse } from '@/src/lib/types/like';

export default function SingleVideoPage({ videoId }: { videoId: string }) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium text-lg">Loading video…</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md text-center">
          <div className="w-24 h-24 bg-linear-to-br from-red-100 to-red-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Video not found
          </h2>
          <p className="text-slate-500 mb-6">
            The video youre looking for doesnt exist or has been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Video Player Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className="aspect-video bg-black">
            <VideoPlayer video={video} />
          </div>

          {/* Video Info */}
          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">{video.title}</h1>

            {/* Stats and Actions Row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* View Count */}
              <div className="flex items-center gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="font-medium">24.5K views</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">2 days ago</span>
                </div>
              </div>

              {/* Like Button */}
              <div className="flex items-center gap-3">
                <LikeButton
                  initialLiked={isliked}
                  initialLikes={likeCount}
                  onToggle={() => apiClient.toggleVideoLike(video._id)}
                  normalize={(res: LikeVideoResponse) => ({
                    liked: res.liked,
                    likesCount: res.totalVideoLikes,
                  })}
                />

                {/* Share Button */}
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {video.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Comments
          </h2>
          <CommentsSection key={videoId} videoId={videoId} />
        </div>
      </div>
    </div>
  );
}
