import { useInfiniteScroll } from '@/hooks/common/useInfiniteScroll';
import { apiClient } from '@/lib/api-client';
import { ProfileVideoResponse } from '@/types/profile';
import { VideoFeed } from '@/types/video';

export function useProfileVideos(userId: string) {
  // Moving code flow towards useInfiniteScroll by passing fetcher, but keeping all the logic in fetcher related to apicall, when useInfiniteScroll needs to get the data coming from backend, it will call fetcher which is operating here and then returning the important data back to useInfiniteScroll.
  return useInfiniteScroll<VideoFeed>({
    enabled: !!userId,
    fetcher: async ({ cursor }) => {
      const res: ProfileVideoResponse = await apiClient.profileVideos(
        userId,
        cursor,
      );

      return {
        items: res.videos,
        nextCursor: res.nextCursor,
      };
    },
  });
}
