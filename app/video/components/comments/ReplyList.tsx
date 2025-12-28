'use client';

import { apiClient } from '@/lib/api-client';
import { usePaginatedList } from '../../hooks/common/usePaginatedList';
import CreateReply from './CreateReply';
import { Comment, CommentListResponse } from '@/lib/types/comment';

type Props = {
  videoId: string;
  parentCommentId: string;
};

export default function ReplyList({ videoId, parentCommentId }: Props) {
  const {
    items: replies,
    loading,
    hasMore,
    loadMore,
  } = usePaginatedList<Comment>((current) =>
    apiClient
      .fetchReplies(videoId, parentCommentId, current)
      .then((res: CommentListResponse) => res.comments),
  );

  return (
    <div className="ml-10 mt-2">
      <CreateReply parentCommentId={parentCommentId} onCreated={() => {}} />

      {replies.map((reply) => (
        <p key={reply._id} className="text-sm">
          <b>{reply.owner.username}</b> {reply.content}
        </p>
      ))}

      {loading && <p className="text-xs">Loading replies…</p>}

      {hasMore && !loading && (
        <button onClick={loadMore} className="text-xs text-blue-600 mt-1">
          Load more replies
        </button>
      )}
    </div>
  );
}
