'use client';
import { apiClient } from '@/lib/api-client';
import type { Comment, CommentListResponse } from '@/lib/types/comment';
import { useNotification } from '@/app/components/providers/notification';
import CommentItem from '@/app/video/components/comments/CommentItem';
import CreateComment from './CreateComment';
import { usePaginatedList } from '../../hooks/common/usePaginatedList';

export default function CommentsSection({ videoId }: { videoId: string }) {
  const {
    items: comments,
    hasMore,
    loadMore,
    loading,
  } = usePaginatedList<Comment>((current) =>
    apiClient
      .fetchVideoComments(videoId, current)
      .then((res: CommentListResponse) => res.comments),
  );

  return (
    <div className="mt-6">
      <CreateComment videoId={videoId} onCreated={() => {}}></CreateComment>

      {comments.map((comment) => (
        <CommentItem key={comment._id} videoId={videoId} comment={comment} />
      ))}

      {loading && <p>Loading comments…</p>}
      {!hasMore && <p>No more comments</p>}

      {hasMore && !loading && (
        <button onClick={loadMore} className="text-xs text-blue-600 mt-1">
          Load more Comments
        </button>
      )}
    </div>
  );
}
