import { useCallback } from 'react';
import { apiClient } from '@/lib/Api-client/api-client';
import { useInfiniteScroll } from '@/hooks/common/useInfiniteScroll';

export function useSearchVideos(query: string) {
  const fetcher = useCallback(
    async ({ cursor }: { cursor: string | null }) => {
      const res = await apiClient.searchVideos({ query, cursor });
      return {
        items: res.videos, // map `videos` -> `items` for useInfiniteScroll
        nextCursor: res.nextCursor,
      };
    },
    [query],
  );

  return useInfiniteScroll({ fetcher, initialCursor: null as string | null });
}