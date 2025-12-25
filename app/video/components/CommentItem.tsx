'use client';
import { Comment } from '@/lib/types/comment';
import { useState } from 'react';
import ReplyList from '@/app/video/components/ReplyList';

export default function CommentItem({
  comment,
  videoId,
}: {
  comment: Comment;
  videoId: string;
}) {
  const [showReplies, setShowReplies] = useState(false);
  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <img
          src={comment.owner.profilePhoto}
          className="w-8 h-8 rounded-full"
        />

        <div>
          <p>
            <b>{comment.owner.username}</b> {comment.content}
          </p>
          <button
            className="text-xs text-gray-500"
            onClick={() => setShowReplies((p) => !p)}
          >
            Reply ({comment.likesCount} likes)
          </button>
        </div>
      </div>

      {showReplies && (
        <ReplyList parentCommentId={comment._id} videoId={videoId} />
      )}
    </div>
  );
}
