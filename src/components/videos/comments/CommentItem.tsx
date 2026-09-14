'use client';
import { Comment } from '@/types/comment';
import { useState } from 'react';
import { useAppDispatch } from '@/store/store';
import ReplyList from '@/components/videos/comments/ReplyList';
import { LikeButton } from '@/components/videos/likes/LikeButton';
import { apiClient } from '@/lib/Api-client/api-client';
import { LikeCommentResponse } from '@/types/like';
import { UserAvatar } from '@/components/videos/comments/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';
import { removeComment } from '@/store/slice/comments.slice';
import { useNotification } from '@/components/notification';
import { useSession } from 'next-auth/react';

export default function CommentItem({
  comment,
  videoId,
}: {
  comment: Comment;
  videoId: string;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const { data: session } = useSession();
  const canManage =
    Boolean(session?.user?.id) &&
    String(comment.commentedBy) === session?.user?.id;

  async function deleteComment() {
    if (deleting || !window.confirm('Delete this comment?')) return;

    setDeleting(true);
    try {
      await apiClient.deleteComment(videoId, comment._id);
      dispatch(removeComment(comment._id));
      showNotification('Comment deleted', 'success');
    } catch {
      showNotification('Failed to delete comment', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="space-y-3">
      <div className="flex items-start gap-3">
        <UserAvatar
          src={comment.owner.profilePhoto || null}
          alt={comment.owner.username}
          size={40}
        />

        <div className="relative min-w-0 flex-1 pr-8">
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Comment actions"
                  className="absolute right-0 top-0 rounded-md p-1 text-gray-500 transition hover:bg-white/10 hover:text-white"
                >
                  <MoreVertical className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-white/10 bg-[#353846] text-gray-200"
              >
                <DropdownMenuItem
                  variant="destructive"
                  disabled={deleting}
                  onSelect={deleteComment}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
                >
                  <Trash2 className="size-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <p className="text-sm leading-6 text-gray-300">
            <span className="mr-1 font-semibold text-white">
              {comment.owner.username}
            </span>
            {comment.content}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <LikeButton
              initialLiked={comment.isLiked}
              initialLikes={comment.likesCount}
              onToggle={() => apiClient.toggleCommentLike(videoId, comment._id)}
              normalize={(res: LikeCommentResponse) => ({
                liked: res.liked,
                likesCount: res.totalCommentLikes,
              })}
            />
            <button
              type="button"
              className="text-xs font-medium text-gray-400 transition hover:text-violet-300"
              onClick={() => setShowReplies((p) => !p)}
            >
              {showReplies ? 'Hide replies' : 'Reply'}
              {comment.repliesCount ? ` (${comment.repliesCount})` : ''}
            </button>
          </div>
        </div>
      </div>

      {showReplies && (
        <ReplyList parentCommentId={comment._id} videoId={videoId} />
      )}
    </article>
  );
}
