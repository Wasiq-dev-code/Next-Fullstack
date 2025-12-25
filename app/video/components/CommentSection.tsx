'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Comment, CommentListResponse } from '@/lib/types/comment';
import { useNotification } from '@/app/components/providers/notification';
import CommentItem from '@/app/video/components/CommentItem';
import CreateComment from '@/app/components/comments/CreateComment';

export default function CommentsSection({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { showNotification } = useNotification();

  const fetchComments = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res: CommentListResponse = await apiClient.fetchVideoComments(
        videoId,
        page,
      );

      if (res.comments.length > 0) {
        setComments((prev) => [...prev, ...res.comments]);
        setPage((prev) => prev + 1);
        showNotification('Comments loaded', 'success');
      } else {
        setHasMore(false);
        showNotification('No more videos', 'info');
      }
    } catch (e) {
      console.error('Failed to load comments', e);
      showNotification('Comments error', 'error');
    } finally {
      setLoading(false);
    }
  }, [videoId, page, loading, hasMore, showNotification]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className="mt-6">
      <CreateComment
        videoId={videoId}
        onCreated={(newComment) => setComments((prev) => [newComment, ...prev])}
      ></CreateComment>

      {comments.map((comment) => (
        <CommentItem key={comment._id} videoId={videoId} comment={comment} />
      ))}

      {loading && <p>Loading comments…</p>}
      {!hasMore && <p>No more comments</p>}
    </div>
  );
}
