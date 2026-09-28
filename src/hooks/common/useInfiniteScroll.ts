import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 300;

type WithId = { _id: string | { toString(): string } };

type FetcherArgs<T, C> = { cursor: C; items: T[] }; // items is back
type FetcherResult<T, C> = { items: T[]; nextCursor: C };

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
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<C>(initialCursor);
  const hasMoreRef = useRef(true);
  const fetchingRef = useRef(false);
  const itemsRef = useRef<T[]>([]);          // always-current copy of items
  const seenRef = useRef<Set<string>>(new Set());
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const stop = () => {
    hasMoreRef.current = false;
    setHasMore(false);
  };

  const loadMore = useCallback(async () => {
    if (!enabled || fetchingRef.current || !hasMoreRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const requestCursor = cursorRef.current;
      const res = await fetcherRef.current({
        cursor: requestCursor,
        items: itemsRef.current,
      });

      const fresh: T[] = [];
      for (const v of res.items ?? []) {
        const id = v._id.toString();
        if (!seenRef.current.has(id)) {
          seenRef.current.add(id);
          fresh.push(v);
        }
      }

      if (fresh.length > 0) {
        itemsRef.current = [...itemsRef.current, ...fresh];
        setItems(itemsRef.current);
      }

      cursorRef.current = res.nextCursor;

      const noNewItems = fresh.length === 0;
      const lastPage = res.nextCursor == null;
      const cursorStuck = res.nextCursor === requestCursor;

      if (noNewItems || lastPage || cursorStuck) stop();
    } catch (err) {
      console.error(err);
      stop();
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      const distance =
        document.body.scrollHeight - window.scrollY - window.innerHeight;
      if (distance < SCROLL_THRESHOLD) loadMore();
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMore, enabled]);

  return { items, loading, hasMore, loadMore, setItems };
}