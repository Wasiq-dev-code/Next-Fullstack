import { createSlice } from '@reduxjs/toolkit';
import { registerUserThunk } from '../thunks/userRegister.thunk';

type UploadedFile = {
  url: string;
  fileId: string;
};

const initialState = {
  profilePhoto: null as UploadedFile | null,
  username: '' as string,
  email: '' as string,
  password: '' as string,
  submitting: false as boolean,
};

const userRegisterSlice = createSlice({
  name: 'userRegister',
  initialState,
  reducers: {
    setProfilePhoto(state, action) {
      state.profilePhoto = action.payload;
    },
    setUsername(state, action) {
      state.username = action.payload;
    },
    setEmail(state, action) {
      state.email = action.payload;
    },
    setPassword(state, action) {
      state.password = action.payload;
    },

    resetFields(state) {
      state.profilePhoto = null;
      state.email = '';
      state.password = '';
      state.username = '';
    },
  },

  extraReducers(builder) {
    builder
      .addCase(registerUserThunk.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(registerUserThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(registerUserThunk.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const {
  resetFields,
  setEmail,
  setPassword,
  setProfilePhoto,
  setUsername,
} = userRegisterSlice.actions;

export default userRegisterSlice.reducer;
