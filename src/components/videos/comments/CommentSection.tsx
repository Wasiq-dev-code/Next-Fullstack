'use client';
import CommentItem from '@/components/videos/comments/CommentItem';
import CreateComment from '@/components/videos/comments/CreateComment';
import { commentSelectors, resetComments } from '@/store/slice/comments.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchComments } from '@/store/thunks/comments.thunk';
import { useEffect } from 'react';

export default function CommentsSection({ videoId }: { videoId: string }) {
  const dispatch = useAppDispatch();
  const comments = useAppSelector(commentSelectors.selectAll);

  const { page, hasMore, loading } = useAppSelector(
    (state) => state.comments.comments,
  );

  useEffect(() => {
    dispatch(resetComments());
    dispatch(fetchComments({ videoId, page: 1 }));

    return () => {
      dispatch(resetComments());
    };
  }, [videoId, dispatch]); // Dispatch will never change because this is redux method, and it will never change

  const loadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchComments({ videoId, page }));
    }
  };

  // const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
  //   trpc.comment.fetchVideoComments.useInfiniteQuery(
  //     {
  //       videoId,
  //       limit: 10,
  //     },
  //     {
  //       getNextPageParam: (lastPage) => lastPage.nextCursor,
  //     },
  //   );

  // const comments = data?.pages.flatMap((pages) => pages.comments) ?? [];

  // const loadMore = () => {
  //   if (hasNextPage && !isFetching) {
  //     fetchNextPage();
  //   }
  // };

  return (
    <div className="space-y-5">
      {/* Comments Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-sm font-medium text-gray-400">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </h3>
      </div>

      {/* Create Comment Section */}
      <div className="rounded-xl border border-violet-500/20 bg-[#2a2d38] p-4">
        <CreateComment videoId={videoId} />
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-linear-to-br from-slate-100 to-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h4 className="mb-1 text-lg font-semibold text-white">
              No comments yet
            </h4>
            <p className="text-sm text-gray-400">
              Be the first to comment on this video!
            </p>
          </div>
        )}

        {comments.map((comment) => (
          <div
            key={comment._id}
            className="rounded-xl border border-white/10 bg-[#2a2d38] p-4 transition-colors hover:border-violet-500/40"
          >
            <CommentItem videoId={videoId} comment={comment} />
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="font-medium text-gray-400">Loading comments...</p>
        </div>
      )}

      {/* End Message */}
      {!hasMore && comments.length > 0 && !loading && (
        <div className="py-6 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">All comments loaded</span>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className="group flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-violet-950/30 transition-all duration-200 hover:bg-violet-500"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Load More Comments
          </button>
        </div>
      )}
    </div>
  );
}
