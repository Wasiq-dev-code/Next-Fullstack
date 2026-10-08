'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/Api-client/api-client'; // adjust path
import type { AnalyticsRange } from '@/types/analytics';

/**
 * Loads ONE analytics panel. Keeps showing the previous data while a new
 * range loads, and fails independently of every other panel.
 */
export function useAnalytics<T>(
  endpoint: string,
  range: AnalyticsRange,
  extra?: Record<string, string>,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const extraKey = extra ? JSON.stringify(extra) : '';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiClient
      .fetchAnalytics<T>(endpoint, range, extra)
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setError('Could not load this panel.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, range, extraKey, reload]);

  const retry = useCallback(() => setReload((k) => k + 1), []);

  return { data, loading, error, retry };
}