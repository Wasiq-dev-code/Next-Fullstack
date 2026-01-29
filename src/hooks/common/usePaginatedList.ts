import { useEffect, useState } from 'react';

export interface Identifiable {
  _id: string;
}

type FetchPageFn<T> = (page: number) => Promise<T[]>;

export function usePaginatedList<T extends Identifiable>(
  fetchPage: FetchPageFn<T>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMore();
  }, []);

  async function loadMore() {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchPage(page);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const map = new Map<string, T>();

          [...prev, ...newItems].forEach((item) => {
            map.set(item._id, item);
          });

          return Array.from(map.values());
        });
        setPage((p) => p + 1);
      }
    } finally {
      setLoading(false);
    }
  }

  return { items, loading, hasMore, loadMore };
}
