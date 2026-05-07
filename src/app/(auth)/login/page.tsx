'use client';

import { useNotification } from '@/components/notification';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'unauthorized') {
      toast.error('Please login or register to access this page');
    } else if (error === 'session-expired') {
      toast.error('Session expired. Please login again');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      showNotification('Email and password are required', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        showNotification(result.error, 'error');
        return;
      }

      showNotification('Login successful', 'success');
      router.push('/');
    } catch {
      showNotification('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#0e0f11] flex items-center justify-center p-4">
      <Toaster />

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-8 space-y-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="text-sm text-neutral-400 mt-1">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm text-neutral-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm text-neutral-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 cursor-pointer text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs text-neutral-500">OR</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* Google */}
        {/* <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-sm transition"
        >
          Continue with Google
        </button> */}

        {/* Footer */}
        <p className="text-center text-sm text-neutral-400">
          Don’t have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className="text-purple-500 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
