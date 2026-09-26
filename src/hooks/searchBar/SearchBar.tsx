import { useInfiniteScroll } from '@/hooks/common/useInfiniteScroll';
import { apiClient } from '@/lib/Api-client/api-client';
import { SearchResponse, VideoFeed } from '@/types/video';

export function useSearchVideoFeed(query: string) {
  return useInfiniteScroll<VideoFeed, string | null>({
    initialCursor: null,
    enabled: !!query,
    fetcher: async ({ cursor }) => {
      const res: SearchResponse = await apiClient.searchVideos({
        query,
        cursor,
      });

      return {
        items: res.videos,
        nextCursor: res.nextCursor,
      };
    },
  });
}