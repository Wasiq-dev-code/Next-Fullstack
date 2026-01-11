import { apiClient } from '@/src/lib/api-client';
import { LikeVideoResponse } from '@/src/lib/types/like';
import { useState } from 'react';

type props = {
  videoId: string;
  initialLikes: number;
  initialLiked: boolean;
};

export default function ToggleLikeOnVideo({
  videoId,
  initialLikes,
  initialLiked,
}: props) {
  const [liked, setLiked] = useState(initialLiked);
  const [totalLikes, setTotalLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res: LikeVideoResponse = await apiClient.toggleVideoLike(videoId);
      setLiked(res.liked);
      setTotalLikes(res.totalVideoLikes);
    } catch (error) {
      console.error('Error toggling video like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={loading}>
      {liked ? '❤️' : '🤍'} {totalLikes}
    </button>
  );
}
