'use client';
import CreateReply from '@/app/components/comments/CreateReply';
import { apiClient } from '@/lib/api-client';
import { Comment, CommentListResponse } from '@/lib/types/comment';
import { useEffect, useState } from 'react';

export default function ReplyList({
  parentCommentId,
}: {
  parentCommentId: string;
}) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadReplies() {
      const res: CommentListResponse = await apiClient.fetchReplies(
        parentCommentId,
        page,
      );
      if (res && res.comments.length > 0) {
        setReplies(res.comments);
        setPage((prev) => prev + 1);
      } else {
      }
    }

    loadReplies();
  }, [parentCommentId, page]);

  return (
    <div className="ml-10 mt-2">
      <CreateReply
        parentCommentId={parentCommentId}
        onCreated={(reply) => setReplies((prev) => [reply, ...prev])}
      ></CreateReply>

      {replies.map((reply) => (
        <p key={reply._id} className="text-sm">
          <b>{reply.owner.username}</b> {reply.content}
        </p>
      ))}
    </div>
  );
}
