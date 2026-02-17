'use client';

import CreateReply from '@/components/videos/comments/CreateReply';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { commentsAdapter } from '@/store/slice/comments.slice';
import { fetchReplies } from '@/store/thunks/comments.thunk';
import { useEffect } from 'react';

type Props = {
  videoId: string;
  parentCommentId: string;
};

export default function ReplyList({ videoId, parentCommentId }: Props) {
  const dispatch = useAppDispatch();
  const replies = useAppSelector((state) => {
    const replyState = state.comments.replies[parentCommentId];
    if (!replyState) return [];
    return commentsAdapter.getSelectors().selectAll(replyState);
  });

  const { hasMore, page, loading } = useAppSelector(
    (state) =>
      state.comments.replies[parentCommentId] ?? {
        hasMore: true,
        page: 1,
        loading: false,
      },
  );

  useEffect(() => {
    dispatch(fetchReplies({ videoId, commentId: parentCommentId, page: 1 }));
  }, [videoId, dispatch, parentCommentId]); // Dispatch will never change because this is redux method, and it will never change

  const loadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchReplies({ videoId, commentId: parentCommentId, page }));
    }
  };

  return (
    <div className="ml-10 mt-2">
      <CreateReply parentCommentId={parentCommentId} videoId={videoId} />

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
