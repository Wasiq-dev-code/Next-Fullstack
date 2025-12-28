'use client';
import { Comment } from '@/lib/types/comment';
import { useState } from 'react';
import ReplyList from '@/app/video/components/comments/ReplyList';
import { LikeButton } from '../likes/LikeButton';
import { apiClient } from '@/lib/api-client';
import { LikeCommentResponse } from '@/lib/types/like';

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
          <LikeButton
            initialLiked={comment.isLiked}
            initialLikes={comment.likesCount}
            onToggle={() => apiClient.toggleCommentLike(videoId, comment._id)}
            normalize={(res: LikeCommentResponse) => ({
              liked: res.liked,
              likesCount: res.totalCommentLikes,
            })}
          ></LikeButton>
          <button
            className="text-xs text-gray-500"
            onClick={() => setShowReplies((p) => !p)}
          ></button>
        </div>
      </div>

      {showReplies && (
        <ReplyList parentCommentId={comment._id} videoId={videoId} />
      )}
    </div>
  );
}
