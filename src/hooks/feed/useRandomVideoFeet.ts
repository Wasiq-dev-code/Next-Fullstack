import { useInfiniteScroll } from '@/hooks/common/useInfiniteScroll';
import { apiClient } from '@/lib/Api-client/api-client';
import { FeedResponse, VideoFeed } from '@/types/video';

export function useRandomVideoFeed() {
  return useInfiniteScroll<VideoFeed, number | null>({
    initialCursor: null,

    fetcher: async ({ cursor, items }) => {
      const res: FeedResponse = await apiClient.fetchRandomFeed({
        cursor,
        excludeIds: items.slice(-100).map((v) => v._id),
      });

      return {
        items: res.videos,
        nextCursor: res.nextCursor,
      };
    },
  });
}
