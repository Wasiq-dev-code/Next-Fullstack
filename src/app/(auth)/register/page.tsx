'use client';

import UploadExample from '@/components/fileUploads';
import { Input } from '@/components/ui/input';
import useRegisterUser from '@/hooks/user/useRegisterUser';
import { signIn } from 'next-auth/react';

export default function UserRegister() {
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    profilePhotoUrl,
    setProfilePhotoUrl,
    setProfilePhotoId,
    canSubmit,
    handleSubmit,
    errors,
    setErrors,
    submitting,
  } = useRegisterUser();

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#0e0f11] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#16171a] border border-white/10 rounded-2xl p-5 space-y-4">
        <h1 className="text-xl font-bold text-white">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errors.general && (
            <p className="text-red-400 text-sm">{errors.general}</p>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Username</label>
            <Input
              placeholder="e.g. cooluser99"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((p) => ({ ...p, username: undefined }));
              }}
              disabled={submitting}
              className="bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm"
            />
            {errors.username && (
              <p className="text-red-400 text-xs">{errors.username}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Email address</label>
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              disabled={submitting}
              className="bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Password</label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              disabled={submitting}
              className="bg-[#1e1f24] border-white/10 text-white placeholder:text-gray-600 w-full h-9 text-sm"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Profile photo</label>
            <div className="border border-dashed border-white/10 rounded-xl p-3 text-center hover:border-purple-500/50 transition-colors">
              <UploadExample
                FileType="image"
                visibility="public"
                onSuccess={(res) => {
                  setProfilePhotoUrl(res.url);
                  setProfilePhotoId(res.fileId);
                  setErrors((p) => ({ ...p, profilePhoto: undefined }));
                }}
              />
            </div>
            {profilePhotoUrl && (
              <p className="text-green-400 text-xs">Photo uploaded ✔</p>
            )}
            {errors.profilePhoto && (
              <p className="text-red-400 text-xs">{errors.profilePhoto}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white py-2 rounded-xl font-medium transition-colors disabled:opacity-40 text-sm"
          >
            {submitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-gray-500">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-[#1e1f24] border border-white/10 text-gray-300 py-2 rounded-xl text-sm hover:bg-[#25262b] transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-violet-400 hover:text-violet-300">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
