'use client';
import { Comment } from '@/src/lib/types/comment';
import { useState } from 'react';
import ReplyList from '@/src/app/videos/components/comments/ReplyList';
import { LikeButton } from '../likes/LikeButton';
import { apiClient } from '@/src/lib/api-client';
import { LikeCommentResponse } from '@/src/lib/types/like';
import Image from 'next/image';
import { UserAvatar } from './UserAvatar';

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
