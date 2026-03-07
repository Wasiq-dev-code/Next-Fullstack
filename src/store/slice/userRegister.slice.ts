import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { filePhoto } from '../type';

interface UserRegister {
  // profilePhoto: UploadedFile | null;
  profilePhotoUrl: string | null;
  profilePhotoId: string | null;
  username: string;
  email: string;
  password: string;
}

const initialState: UserRegister = {
  profilePhotoId: null,
  profilePhotoUrl: null,
  username: '',
  email: '',
  password: '',
};

const userRegisterSlice = createSlice({
  name: 'userRegister',
  initialState,
  reducers: {
    setProfilePhoto(state, action: PayloadAction<filePhoto>) {
      state.profilePhotoId = action.payload.profilePhotoId;
      state.profilePhotoUrl = action.payload.profilePhotoUrl;
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

    resetFields() {
      return initialState;
    },
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
