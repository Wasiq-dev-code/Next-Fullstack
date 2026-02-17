import { createSlice } from '@reduxjs/toolkit';
import { registerUserThunk } from '@/store/thunks/userRegister.thunk';
import { UploadedFile } from '@/types/file';

interface UserRegister {
  profilePhoto: UploadedFile | null;
  username: string;
  email: string;
  password: string;
  submitting: boolean;
}

const initialState: UserRegister = {
  profilePhoto: null,
  username: '',
  email: '',
  password: '',
  submitting: false,
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

  // After calling backend in Thunk, we have to manage submitting state constantly for frontend.
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
