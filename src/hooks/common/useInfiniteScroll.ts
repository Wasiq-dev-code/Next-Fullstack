import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 300;

type FetcherArgs<T> = {
  cursor: number | null;
  items: T[];
};

type WithId = {
  _id: string | { toString(): string };
};

type FetcherResult<T> = {
  items: T[];
  nextCursor: number | null;
};

type UseInfiniteScrollProps<T> = {
  fetcher: (args: FetcherArgs<T>) => Promise<FetcherResult<T>>;
  enabled?: boolean;
};

export function useInfiniteScroll<T extends WithId>(
  // Getting reference of fetcher for call when needed
  { fetcher, enabled = true }: UseInfiniteScrollProps<T>,
) {
  // Basic state management
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!enabled || fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      // Here, we are passing current state of cursor and items, which are requirments to call api. Afterthen it will give us the data which fetcher is returning from specific hooks
      const res = await fetcher({ cursor, items });

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
      setHasMore(res.nextCursor !== null);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [fetcher, cursor, items, hasMore, enabled]);

  // initial load for render items
  useEffect(() => {
    loadMore();
  }, []);

  // scroll listener, if height 300px remain from bottom it will call api again.
  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      const distance =
        document.body.scrollHeight - window.scrollY - window.innerHeight;

      // If height from bottom remain below 300px? it will reload loadmore() func. Basically it will recall api for more items to set
      if (distance < SCROLL_THRESHOLD) {
        loadMore();
      }
    };

    // We assigned onScroll method for to be dependent upon scrolling
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMore, enabled]);

  // This is where we return current states to ui component for managing stuff
  return {
    items,
    loading,
    hasMore,
    loadMore,
    setItems,
  };
}
