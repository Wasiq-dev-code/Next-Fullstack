import { apiClient } from '@/lib/Api-client/api-client';
import { createAsyncThunk } from '@reduxjs/toolkit';

// Fetch Comment List
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (
    { videoId, page }: { videoId: string; page: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.fetchVideoComments(videoId, page);
      if (!res) {
        throw new Error('Got error');
      }

      return {
        comments: res.comments,
        hasMore: res.hasMore,
      };
    } catch (error) {
      return rejectWithValue(`Didnt successfull to fetch, ${error}`);
    }
  },
);

// Create Comment
export const createComment = createAsyncThunk(
  'comments/createComment',
  async (
    { videoId, content }: { videoId: string; content: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.createVideoComment(videoId, { content });
      if (!res) {
        throw new Error('got error while creating comment');
      }
      return res.comment;
    } catch (err) {
      return rejectWithValue('Failed to create comment' + err);
    }
  },
);

// Reply List Of Each Comments
export const fetchReplies = createAsyncThunk(
  'comments/fetchReplies',
  async (
    { videoId, commentId }: { videoId: string; commentId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.fetchReplies(videoId, commentId);
      if (!res) {
        throw new Error('Got error while fetching replies');
      }

      return {
        commentId,
        replies: res.comments,
        hasMore: res.hasMore,
      };
    } catch (error) {
      return rejectWithValue(`Didnt successfull to fetch replies, ${error}`);
    }
  },
);

// Create Reply Of Comment
export const createReply = createAsyncThunk(
  'comments/createCommentReply',
  async (
    {
      videoId,
      commentId,
      content,
    }: { videoId: string; commentId: string; content: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.createReply(videoId, commentId, { content });
      if (!res) {
        throw new Error('got error while creating reply');
      }
      return {
        commentId,
        reply: res.reply,
      };
    } catch (err) {
      return rejectWithValue('Failed to create reply' + err);
    }
  },
);
