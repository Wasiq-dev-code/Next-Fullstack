'use client';

import { useNotification } from '@/components/notification';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    // Notification setup for unauth user who click on auth paths
    if (error === 'unauthorized') {
      toast.error('Please login or register to access this page', {
        id: 'auth-error',
        duration: 4000,
        position: 'bottom-center',
      });
    }
    // Notification setup for session expired and especifically for user who changed email or password. Logout and redirect to login page with this notification
    else if (error === 'session-expired') {
      toast.error('Your session has expired. Please login again', {
        id: 'session-error',
        duration: 4000,
        position: 'top-right',
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Basic client-side validation
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

      // Success
      showNotification('Login successful', 'success');
      router.push('/'); // or wherever you want
    } catch (error) {
      console.error(error);
      showNotification('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            disabled={loading}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/' })}
        disabled={loading}
      >
        Continue with Google
      </button>
    </>
  );
}

export default LoginComponent;
