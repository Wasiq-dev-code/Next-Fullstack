import { configureStore } from '@reduxjs/toolkit';
import videoRegisterReducer from '@/store/slice/videoUpload.slice';
import userRegisterReducer from '@/store/slice/userRegister.slice';
import commentsReducer from '@/store/slice/comments.slice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/type';

export const store = configureStore({
  reducer: {
    registerVideo: videoRegisterReducer,
    userRegister: userRegisterReducer,
    comments: commentsReducer,
  },
});

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
