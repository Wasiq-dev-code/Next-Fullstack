import { requireAuth } from '@/lib/validations/requireAuth';
import { requireVideoOwner } from '@/lib/validations/requireVideoOwner';
import { Result, VideoAuthData } from '@/types/result';

export async function withVideoAuth(
  videoId: string,
): Promise<Result<VideoAuthData>> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const videoGuard = await requireVideoOwner(videoId, auth.data);
  if (!videoGuard.ok) return videoGuard;

  return {
    ok: true,
    data: {
      userId: auth.data,
      video: videoGuard.data,
    },
  };
}
