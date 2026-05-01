'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/Api-client/api-client';
import { useNotification } from '@/components/notification';

export default function VerifyPage() {
  const [code, setCode] = useState<string>('');
  const { username } = useParams();
  const [err, setErr] = useState<boolean>(false);
  const router = useRouter();

  const { showNotification } = useNotification();

  console.log('PAKISTAN');

  const handleVerify = async () => {
    try {
      setErr(false);

      const verifyCode = await apiClient.emailVerification({
        username: username as string,
        code,
      });

      if (!verifyCode) {
        throw new Error('Verifycode Err');
      }
      showNotification('User Registered Successfully', 'success');
      router.push('/login');

      setCode('');
    } catch (error) {
      setErr(true);
      throw new Error('Erro while handleVerify');
    }
  };

  return (
    <div>
      <h1>Verify your email</h1>
      <p>Code bhejo jo email pe aaya</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="6 digit code"
      />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
}
