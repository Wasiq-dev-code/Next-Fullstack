'use client';

import { useNotification } from '@/components/providers/notification';
import { apiClient } from '@/src/lib/api-client';
import { useState } from 'react';

export default function PrivateProfile() {
  const [isPrivate, setIsPrivate] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleTogglePrivacy = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await apiClient.isPrivate();

      setIsPrivate(res.isPrivate);

      showNotification(res.message, 'info');
    } catch {
      showNotification('Failed to update privacy status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="mt-16 px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      onClick={handleTogglePrivacy}
      disabled={loading}
    >
      {loading
        ? 'Updating...'
        : isPrivate
          ? 'Make Profile Public'
          : 'Make Profile Private'}
    </button>
  );
}
