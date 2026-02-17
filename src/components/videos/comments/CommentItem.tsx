'use client';
import { Comment } from '@/types/comment';
import { useState } from 'react';
import ReplyList from '@/components/videos/comments/ReplyList';
import { LikeButton } from '@/components/videos/likes/LikeButton';
import { apiClient } from '@/lib/Api-client/api-client';
import { LikeCommentResponse } from '@/types/like';
import { UserAvatar } from '@/components/videos/comments/UserAvatar';

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
        <UserAvatar
          src={comment.owner.profilePhoto}
          alt={comment.owner.username}
        ></UserAvatar>

        <div>
          <p className="text-sm leading-snug">
            <span className="font-semibold mr-1">{comment.owner.username}</span>
            {comment.content}
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
