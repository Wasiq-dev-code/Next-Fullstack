import { apiClient } from '@/lib/api-client';
import { rollbackDelete } from '@/lib/rollBackDelete';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { resetUpload } from '../slice/videoUpload.slice';

export const createVideoThunk = createAsyncThunk<
  void,
  { title: string; description: string },
  { state: RootState }
>(
  'videoRegister/create',
  async ({ title, description }, { getState, dispatch }) => {
    const { video, thumbnail } = getState().videoRegister;

    if (!video || !thumbnail) {
      throw new Error('Video or thumbnail missing');
    }

    try {
      await apiClient.createVideo({
        title,
        description,
        video,
        thumbnail,
      });

      // Reset
      dispatch(resetUpload());
    } catch (err) {
      await Promise.allSettled([
        rollbackDelete(thumbnail.fileId),
        rollbackDelete(video.fileId),
      ]).catch((err) => {
        throw new Error('Error while deleting rollback delete', err);
      });

      throw err;
    }
  },
);
