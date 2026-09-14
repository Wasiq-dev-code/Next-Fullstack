'use client';

import { useEffect } from 'react';
import { useLike } from '@/hooks/like/useLike';
import { Button } from '@/components/ui/button';

type LikeButtonProps<T> = {
  initialLiked: boolean;
  initialLikes: number;
  onToggle: () => Promise<T>;
  normalize: (res: T) => { liked: boolean; likesCount: number };
};

export function LikeButton<T>({
  initialLiked,
  initialLikes,
  onToggle,
  normalize,
}: LikeButtonProps<T>) {
  const { liked, likesCount, loading, toggle, setLiked, setLikesCount } =
    useLike(onToggle, normalize);

  useEffect(() => {
    setLiked(initialLiked);
    setLikesCount(initialLikes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLiked, initialLikes]);

  return (
    <Button
      variant={liked ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={
        liked
          ? 'bg-violet-600 text-white hover:bg-violet-500'
          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-violet-500/15 hover:text-violet-200'
      }
    >
      {liked ? '❤️' : '🤍'} {likesCount}
    </Button>
  );
}
