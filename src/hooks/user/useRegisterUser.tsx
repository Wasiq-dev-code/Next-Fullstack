'use client';
import { useNotification } from '@/components/notification';
import { AppDispatch, RootState } from '@/store/store';
import { registerUserThunk } from '@/store/thunks/userRegister.thunk';
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

  // 2: IMPORTANT NOTE. We can only get all this states if the ever update or set in redux. We are getting the state and passing for ui comp.
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
      // 3: IMPORTANT NOTE. This thunk is specially for calling and passing the data to backend if it's in state
      await dispatch(registerUserThunk()).unwrap();
      showNotification('User Register Successfully', 'success');
    } catch (err: any) {
      showNotification('User Register failed', 'error');

      setErrors({
        general: err?.message ?? 'Registration failed',
      });
    }
  };

  // 4: IMPORTANT NOTE. Now we gets all states and respectively called backend and passed the entire data, which was desireable for backend. Now we are passing these states to ui comp to update each.
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
