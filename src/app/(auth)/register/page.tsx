'use client';

import UploadExample from '@/components/fileUploads';
import useRegisterUser from '../../../hooks/common/useRegisterUser';
import { useDispatch } from 'react-redux';
import {
  setEmail,
  setPassword,
  setProfilePhoto,
  setUsername,
} from '@/src/store/slice/userRegister.slice';
import { AppDispatch } from '@/src/store/store';
import { signIn } from 'next-auth/react';

export default function UserRegister() {
  const {
    canSubmit,
    email,
    errors,
    handleSubmit,
    password,
    profilePhoto,
    setErrors,
    submitting,
    username,
  } = useRegisterUser();

  const dispatch = useDispatch<AppDispatch>();
  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Register User</h2>

        {errors.general && (
          <p className="text-red-600 text-sm">{errors.general}</p>
        )}

        <div>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => {
              dispatch(setUsername(e.target.value));
              setErrors((p) => ({ ...p, username: undefined }));
            }}
            disabled={submitting}
            className="w-full border p-2 rounded"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username}</p>
          )}
        </div>

        <div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => {
              dispatch(setEmail(e.target.value));
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            disabled={submitting}
            className="w-full border p-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              dispatch(setPassword(e.target.value));
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            disabled={submitting}
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-1">Profile Photo</h4>
          <UploadExample
            FileType="image"
            visibility="public"
            onSuccess={(res) => {
              dispatch(setProfilePhoto(res));
              setErrors((p) => ({ ...p, profilePhoto: undefined }));
            }}
          />
          {profilePhoto && (
            <p className="text-green-600 text-sm">Photo uploaded ✔</p>
          )}
          {errors.profilePhoto && (
            <p className="text-red-500 text-sm">{errors.profilePhoto}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/' })}
        // disabled={loading}
      >
        Continue with Google
      </button>
    </>
  );
}
