import {
  createEntityAdapter,
  createSlice,
  EntityState,
} from '@reduxjs/toolkit';
import { Comment } from '@/types/comment';
import {
  fetchComments,
  fetchReplies,
  createComment,
  createReply,
} from '@/store/thunks/comments.thunk';
import { RootState } from '@/store/type';

// ADAPTER SETUP

// The adapter handles our "items" list as a "normalized" object with IDs
const commentsAdapter = createEntityAdapter<Comment, string>({
  selectId: (comment) => comment._id,
});

// TYPES

// Shape for any list that needs pagination (Main Comments or individual Reply folders)
interface PaginatedState extends EntityState<Comment, string> {
  page: number;
  hasMore: boolean;
  loading: boolean;
}

interface CommentsState {
  comments: PaginatedState;
  replies: Record<string, PaginatedState>; // Each comment ID gets its own paginated folder
  creating: boolean;
  error?: string;
}

// HELPERS
const getInitialPaginatedState = (): PaginatedState => ({
  ...commentsAdapter.getInitialState(),
  page: 1,
  hasMore: true,
  loading: false,
});

const initialState: CommentsState = {
  comments: getInitialPaginatedState(),
  replies: {},
  creating: false,
  error: undefined,
};

// SLICE
const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // Action to clear everything when moving to a new video
    resetComments: () => initialState,
  },
  extraReducers: (builder) => {
    // FETCH COMMENTS (PAGINATED)
    builder
      .addCase(fetchComments.pending, (state) => {
        state.comments.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments.loading = false;
        // upsertMany automatically merges data and prevents duplicates by ID
        commentsAdapter.upsertMany(state.comments, action.payload.comments);
        state.comments.page += 1;
        state.comments.hasMore = action.payload.hasMore;
      })
      .addCase(fetchComments.rejected, (state) => {
        state.comments.loading = false;
      });

    // FETCH REPLIES (PAGINATED)
    builder
      .addCase(fetchReplies.pending, (state, action) => {
        const { commentId } = action.meta.arg;

        // Ensure replies folder exists for this comment.
        // First reply might come before fetchReplies, so we need to initialize.
        // Avoids runtime errors when adding to non-existent state object.
        state.replies[commentId] ??= getInitialPaginatedState();
        state.replies[commentId].loading = true;
      })
      .addCase(fetchReplies.fulfilled, (state, action) => {
        const { commentId, replies, hasMore } = action.payload;
        const replyState = state.replies[commentId];

        replyState.loading = false;
        commentsAdapter.upsertMany(replyState, replies);
        replyState.page += 1;
        replyState.hasMore = hasMore;
      });

    // CREATE COMMENT
    builder
      .addCase(createComment.fulfilled, (state, action) => {
        state.creating = false;
        // addOne adds a single item to the list
        commentsAdapter.addOne(state.comments, action.payload);
      })
      .addCase(createComment.pending, (state) => {
        state.creating = true;
      })
      //  CREATE REPLY
      .addCase(createReply.fulfilled, (state, action) => {
        const { commentId, reply } = action.payload;

        // Ensure replies folder exists for this comment.
        // First reply might come before fetchReplies, so we need to initialize.
        // Avoids runtime errors when adding to non-existent state object.
        state.replies[commentId] ??= getInitialPaginatedState();
        commentsAdapter.addOne(state.replies[commentId], reply);

        //Adding repliesCount for enhancing ui performan
        const parent = state.comments.entities[commentId];
        if (parent) parent.repliesCount = (parent.repliesCount ?? 0) + 1;
      })
      .addCase(createReply.pending, (state) => {
        state.creating = true;
      });
  },
});

export const { resetComments } = commentsSlice.actions; // all reducer value pass through actions
export default commentsSlice.reducer;

export { commentsAdapter };
// Selectors for easy use in Components
export const commentSelectors = commentsAdapter.getSelectors<RootState>(
  (state) => state.comments.comments,
);
