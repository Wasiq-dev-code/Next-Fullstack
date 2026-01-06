import { createSlice } from '@reduxjs/toolkit';
import { createVideoThunk } from '../thunks/videoUpload.thunk';

type UploadedFile = {
  url: string;
  fileId: string;
};

const initialState = {
  video: null as UploadedFile | null,
  thumbnail: null as UploadedFile | null,
  submitting: false as boolean,
};

const videoUploadSlice = createSlice({
  name: 'registerVideo',
  initialState,
  reducers: {
    setVideo(state, action) {
      state.video = action.payload;
    },

    setThumbnail(state, action) {
      state.thumbnail = action.payload;
    },

    resetUpload(state) {
      state.video = null;
      state.thumbnail = null;
    },
  },

  extraReducers(builder) {
    builder
      .addCase(createVideoThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createVideoThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createVideoThunk.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const { resetUpload, setThumbnail, setVideo } = videoUploadSlice.actions;

export default videoUploadSlice.reducer;
