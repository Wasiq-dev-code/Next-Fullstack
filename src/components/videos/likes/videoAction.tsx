import { LikeVideoResponse } from '@/types/like';
import { LikeButton } from '@/components/videos/likes/LikeButton';
import { apiClient } from '@/lib/api-client';

type Props = {
  videoId: string;
  isLiked: boolean;
  likeCount: number;
};

export function VideoActions({ videoId, isLiked, likeCount }: Props) {
  return (
    <div className="flex items-center gap-3">
      <LikeButton
        initialLiked={isLiked}
        initialLikes={likeCount}
        onToggle={() => apiClient.toggleVideoLike(videoId)}
        normalize={(res: LikeVideoResponse) => ({
          liked: res.liked,
          likesCount: res.totalVideoLikes,
        })}
      />
    </div>
  );
}
