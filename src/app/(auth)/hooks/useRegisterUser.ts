import { useNotification } from '@/src/app/components/providers/notification';
import { AppDispatch, RootState } from '@/src/store/store';
import { registerUserThunk } from '@/src/store/thunks/userRegister.thunk';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  profilePhoto?: string;
  general?: string;
};

export default function useRegisterUser() {
  const dispatch = useDispatch<AppDispatch>();
  const [errors, setErrors] = useState<FieldErrors>({});

  const { email, password, profilePhoto, submitting, username } = useSelector(
    (state: RootState) => state.userRegister,
  );

  const { showNotification } = useNotification();

  const canSubmit =
    Boolean(username.trim()) &&
    Boolean(email.trim()) &&
    Boolean(password.trim()) &&
    Boolean(profilePhoto) &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setErrors({});

    try {
      await dispatch(registerUserThunk()).unwrap();
      showNotification('User Register Successfully', 'success');
    } catch (err: any) {
      showNotification('User Register failed', 'error');

      setErrors({
        general: err?.message ?? 'Registration failed',
      });
    }
  };

  return {
    username,
    email,
    password,
    profilePhoto,
    canSubmit,
    handleSubmit,
    submitting,
    setErrors,
    errors,
  };
}
