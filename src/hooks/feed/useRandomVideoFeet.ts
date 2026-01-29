import { useInfiniteScroll } from '@/hooks/common/useInfiniteScroll';
import { apiClient } from '@/lib/api-client';
import { FeedResponse, VideoFeed } from '@/types/video';

export function useRandomVideoFeed() {
  // Moving code flow towards useInfiniteScroll by passing fetcher, but keeping all the logic in fetcher related to apicall, when useInfiniteScroll needs to get the data coming from backend, it will call fetcher which is operating here and then returning the important data back to useInfiniteScroll.
  return useInfiniteScroll<VideoFeed>({
    fetcher: async ({ cursor, items }) => {
      const res: FeedResponse = await apiClient.fetchRandomFeed({
        cursor,
        excludeIds: items.slice(-100).map((v) => v._id),
      });

      // console.log('API VIDEOS:', res.videos);

      return {
        items: res.videos,
        nextCursor: res.nextCursor,
      };
    },
  });
}
