'use client';

import CreateReply from '@/app/components/comments/CreateReply';
import { apiClient } from '@/lib/api-client';
import { Comment } from '@/lib/types/comment';
import { useEffect, useState } from 'react';

type Props = {
  videoId: string;
  parentCommentId: string;
};

export default function ReplyList({ videoId, parentCommentId }: Props) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Initial load
  useEffect(() => {
    loadReplies(1);
    setPage(2);
  }, [videoId, parentCommentId]);

  async function loadReplies(currentPage: number) {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await apiClient.fetchReplies(
        videoId,
        parentCommentId,
        currentPage,
      );

      if (res.comments.length > 0) {
        setReplies((prev) => [...prev, ...res.comments]);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Failed to load replies', e);
    } finally {
      setLoading(false);
    }
  }

  const handleLoadMore = () => {
    loadReplies(page);
    setPage((p) => p + 1);
  };

  return (
    <div className="ml-10 mt-2">
      <CreateReply
        parentCommentId={parentCommentId}
        onCreated={(reply) => setReplies((prev) => [reply, ...prev])}
      />

      {replies.map((reply) => (
        <p key={reply._id} className="text-sm">
          <b>{reply.owner.username}</b> {reply.content}
        </p>
      ))}

      {loading && <p className="text-xs">Loading replies…</p>}

      {hasMore && !loading && (
        <button onClick={handleLoadMore} className="text-xs text-blue-600 mt-1">
          Load more replies
        </button>
      )}
    </div>
  );
}
