'use client';
import { useNotification } from '@/components/notification';
import { trpc } from '@/lib/trpc';
import { resetFields } from '@/store/slice/userRegister.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { RootState } from '@/store/type';
import { useState } from 'react';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  profilePhoto?: string;
  general?: string;
};

export default function useRegisterUser() {
  const dispatch = useAppDispatch();
  const [errors, setErrors] = useState<FieldErrors>({});
  const { mutateAsync, isPending } = trpc.auth.register.useMutation();
  const deleteTempFileMutation = trpc.imageKit.deleteTempFile.useMutation();

  const { email, password, profilePhotoUrl, profilePhotoId, username } =
    useAppSelector((state: RootState) => state.userRegister);

  const { showNotification } = useNotification();

  const canSubmit =
    Boolean(username.trim()) &&
    Boolean(email.trim()) &&
    Boolean(password.trim()) &&
    Boolean(profilePhotoUrl) &&
    Boolean(profilePhotoId) &&
    !isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrors({});

    try {
      if (
        !email ||
        !password ||
        !profilePhotoUrl ||
        !profilePhotoId ||
        !username
      ) {
        dispatch(resetFields());
        throw new Error('fields are missing');
      }

      const user = await mutateAsync({
        email,
        password,
        profilePhotoUrl,
        profilePhotoId,
        username,
      });

      if (!user) {
        throw new Error('Error on backend while registering User');
      }

      showNotification('User Register Successfully', 'success');
      dispatch(resetFields());
    } catch (err: any) {
      showNotification('User Register failed', 'error');

      setErrors({
        general: err?.message ?? 'Registration failed',
      });

      try {
        if (profilePhotoId) {
          // When backend response failed, Delete that photo from cloud imagekit

          await deleteTempFileMutation.mutateAsync(
            { fileId: profilePhotoId },
            {
              onError: (err) => {
                console.error('Image cleanup failed', err);
              },
            },
          );
          dispatch(resetFields());
        }
      } catch (delErr) {
        console.error('Error while deleting through public path', delErr);
      }
    }
  };

  // 4: IMPORTANT NOTE. Now we gets all states and respectively called backend and passed entire data, which was desireable for backend. Now we are passing these states to ui comp to update each.
  return {
    username,
    email,
    password,
    profilePhotoUrl,
    profilePhotoId,
    canSubmit,
    handleSubmit,
    setErrors,
    errors,
    submitting: isPending,
  };
}
