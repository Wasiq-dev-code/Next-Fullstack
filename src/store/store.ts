import { configureStore } from '@reduxjs/toolkit';
import videoRegisterReducer from '@/store/slice/videoUpload.slice';
import userRegisterReducer from '@/store/slice/userRegister.slice';

export const store = configureStore({
  reducer: {
    registerVideo: videoRegisterReducer,
    userRegister: userRegisterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
