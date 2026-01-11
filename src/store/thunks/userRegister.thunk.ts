import { apiClient } from '@/src/lib/api-client';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { resetFields } from '../slice/userRegister.slice';
import { RootState } from '../store';

export const registerUserThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('userRegister/create', async (_, { getState, dispatch }) => {
  const { email, password, profilePhoto, username } = getState().userRegister;

  if (!email || !password || !profilePhoto || !username) {
    throw new Error('fields are missing');
  }

  try {
    await apiClient.registerUser({ email, password, profilePhoto, username });

    dispatch(resetFields());
  } catch (err) {
    try {
      if (profilePhoto?.fileId) {
        await fetch(`/api/auth/imageKit-del`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: profilePhoto.fileId }),
        });
      }
    } catch (delErr) {
      console.error('Error while deleting through public path', delErr);
    }

    throw err;
  }
});
