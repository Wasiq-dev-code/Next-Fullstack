'use client';

import CreateReply from '@/components/videos/comments/CreateReply';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { commentsAdapter } from '@/store/slice/comments.slice';
import { fetchReplies } from '@/store/thunks/comments.thunk';
import { LikeButton } from '@/components/videos/likes/LikeButton';
import { apiClient } from '@/lib/Api-client/api-client';
import { LikeCommentResponse } from '@/types/like';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';
import { removeReply } from '@/store/slice/comments.slice';
import { useNotification } from '@/components/notification';
import { Comment } from '@/types/comment';
import { useSession } from 'next-auth/react';
import { UserAvatar } from '@/components/videos/comments/UserAvatar';

type Props = {
  videoId: string;
  parentCommentId: string;
};

export default function ReplyList({ videoId, parentCommentId }: Props) {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
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
    <div className="ml-4 border-l-2 border-violet-500/30 pl-4 sm:ml-12">
      <CreateReply parentCommentId={parentCommentId} videoId={videoId} />

      {replies.map((reply) => (
        <ReplyItem
          key={reply._id}
          reply={reply}
          videoId={videoId}
          onDeleted={() =>
            dispatch(removeReply({ parentCommentId, replyId: reply._id }))
          }
          showNotification={showNotification}
        />
      ))}

      {loading && <p className="mt-3 text-xs text-gray-500">Loading replies...</p>}

      {hasMore && !loading && (
        <button
          type="button"
          onClick={loadMore}
          className="mt-3 text-xs font-medium text-violet-400 hover:text-violet-300"
        >
          Load more replies
        </button>
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  videoId,
  onDeleted,
  showNotification,
}: {
  reply: Comment;
  videoId: string;
  onDeleted: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const { data: session } = useSession();
  const canManage =
    Boolean(session?.user?.id) && String(reply.commentedBy) === session?.user?.id;

  async function deleteReply() {
    if (deleting || !window.confirm('Delete this reply?')) return;

    setDeleting(true);
    try {
      await apiClient.deleteComment(videoId, reply._id);
      onDeleted();
      showNotification('Reply deleted', 'success');
    } catch {
      showNotification('Failed to delete reply', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative mt-4 pr-8">
      {canManage && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Reply actions"
            className="absolute right-0 top-0 rounded-md p-1 text-gray-500 transition hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-white/10 bg-[#353846] text-gray-200">
          <DropdownMenuItem
            variant="destructive"
            disabled={deleting}
            onSelect={deleteReply}
            className="text-red-400 focus:bg-red-500/10 focus:text-red-300"
          >
            <Trash2 className="size-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>}
      <div className="flex items-start gap-3">
        <UserAvatar
          src={reply.owner.profilePhoto}
          alt={reply.owner.username}
          size={32}
        />
        <div className="min-w-0">
          <p className="text-sm leading-6 text-gray-300">
            <b className="text-white">{reply.owner.username}</b>{' '}
            {reply.content}
          </p>
          <LikeButton
            initialLiked={reply.isLiked}
            initialLikes={reply.likesCount}
            onToggle={() => apiClient.toggleCommentLike(videoId, reply._id)}
            normalize={(res: LikeCommentResponse) => ({
              liked: res.liked,
              likesCount: res.totalCommentLikes,
            })}
          />
        </div>
      </div>
    </div>
  );
}
