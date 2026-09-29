import { useCallback } from 'react';
import { apiClient } from '@/lib/Api-client/api-client';
import { useInfiniteScroll } from '@/hooks/common/useInfiniteScroll';

export function useSearchVideos(query: string) {
  // console.log('useSearchVideos query:', query)
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
//  console.log('useSearchVideos query:', query, 'fetcher:', fetcher);
  return useInfiniteScroll({ fetcher, initialCursor: null as string | null });
}