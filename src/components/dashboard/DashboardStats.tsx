'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/Api-client/api-client'; // adjust path
import type { ChannelStatsResponse } from '@/types/channel';

export default function DashboardStats() {
  const [data, setData] = useState<ChannelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiClient.fetchChannelStats());
    } catch {
      setError('Could not load your stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = [
    { label: 'Total Videos', value: data?.totalVideos },
    { label: 'Total Views', value: data?.totalViews },
    { label: 'Your Subscribers', value: data?.followersCount },
  ];

  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-red-900/50 bg-red-950/30 p-5 text-sm text-red-300">
        {error}{' '}
        <button onClick={load} className="underline hover:text-red-200">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-slate-800 bg-slate-900 p-5"
        >
          <p className="text-sm text-slate-400">{s.label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-24 animate-pulse rounded bg-slate-800" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-white">
              {(s.value ?? 0).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}