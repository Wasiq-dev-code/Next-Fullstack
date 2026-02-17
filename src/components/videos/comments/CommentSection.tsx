'use client';
import CommentItem from '@/components/videos/comments/CommentItem';
import CreateComment from '@/components/videos/comments/CreateComment';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { commentSelectors, resetComments } from '@/store/slice/comments.slice';
import { useEffect } from 'react';
import { fetchComments } from '@/store/thunks/comments.thunk';

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

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>{comments.length}</span>
          <span className="text-slate-600">Comments</span>
        </h3>
      </div>

      {/* Create Comment Section */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 p-5 rounded-2xl border-2 border-blue-100">
        <CreateComment videoId={videoId} onCreated={() => {}}></CreateComment>
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
            <h4 className="text-lg font-semibold text-slate-700 mb-1">
              No comments yet
            </h4>
            <p className="text-sm text-slate-500">
              Be the first to comment on this video!
            </p>
          </div>
        )}

        {comments.map((comment) => (
          <div
            key={comment._id}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <CommentItem videoId={videoId} comment={comment} />
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600 font-medium">Loading comments…</p>
        </div>
      )}

      {/* End Message */}
      {!hasMore && comments.length > 0 && !loading && (
        <div className="py-6 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500">
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
            className="group flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
