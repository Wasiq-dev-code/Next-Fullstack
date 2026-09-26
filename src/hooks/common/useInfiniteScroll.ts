import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 300;

type FetcherArgs<T, C> = {
  cursor: C;
  items: T[];
};

type WithId = {
  _id: string | { toString(): string };
};

type FetcherResult<T, C> = {
  items: T[];
  nextCursor: C;
};

type UseInfiniteScrollProps<T, C> = {
  fetcher: (args: FetcherArgs<T, C>) => Promise<FetcherResult<T, C>>;
  initialCursor: C;
  enabled?: boolean;
};

export function useInfiniteScroll<T extends WithId, C>({
  fetcher,
  initialCursor,
  enabled = true,
}: UseInfiniteScrollProps<T, C>) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<C>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!enabled || fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await fetcher({
        cursor,
        items,
      });

      if (!res.items || res.items.length === 0) {
        setHasMore(false);
        return;
      }

      setItems((prev) => {
        const map = new Map(prev.map((v) => [v._id.toString(), v]));

        [...prev, ...res.items].forEach((v) => {
          map.set(v._id.toString(), v);
        });

        return Array.from(map.values());
      });

      setCursor(res.nextCursor);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [fetcher, cursor, items, hasMore, enabled]);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      const distance =
        document.body.scrollHeight -
        window.scrollY -
        window.innerHeight;

      if (distance < SCROLL_THRESHOLD) {
        loadMore();
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [loadMore, enabled]);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    setItems,
  };
}