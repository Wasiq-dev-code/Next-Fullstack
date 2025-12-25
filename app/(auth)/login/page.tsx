'use client';
import { useNotification } from '@/app/components/providers/notification';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string) => {
  return password.length >= 6;
};

function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // if (isValidEmail(email) && isValidPassword(password)) {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        showNotification(`${result?.error}`, 'error');
      }

      // Redirect to feed page
      // } else {
      showNotification('Login', 'success');
      setPassword('');
      setEmail('');
      // }
    } catch (error) {
      console.error(error);
      showNotification('Error while login', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login Form</h2>
      <div>
        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </div>
      <button type="submit">Login</button>
      {loading && <p>Loading..</p>}
    </form>
  );
}

export default LoginComponent;
