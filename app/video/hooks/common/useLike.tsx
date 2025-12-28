import { useState } from 'react';

export function useLike<T>(
  toggleFn: () => Promise<T>,
  normalize: (res: T) => { liked: boolean; likesCount: number },
) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await toggleFn();
      const normalized = normalize(res);
      setLiked(normalized.liked);
      setLikesCount(normalized.likesCount);
    } finally {
      setLoading(false);
    }
  }

  return { liked, likesCount, loading, toggle, setLiked, setLikesCount };
}
