'use client';

import { useEffect } from 'react';
import { useLike } from '../../../../hooks/common/useLike';

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
    <button onClick={toggle} disabled={loading}>
      {liked ? '❤️' : '🤍'} {likesCount}
    </button>
  );
}
