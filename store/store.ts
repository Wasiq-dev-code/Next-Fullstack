import { configureStore } from '@reduxjs/toolkit';
import videoRegisterReducer from './slice/videoUpload.slice';

export const store = configureStore({
  reducer: {
    videoRegister: videoRegisterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
