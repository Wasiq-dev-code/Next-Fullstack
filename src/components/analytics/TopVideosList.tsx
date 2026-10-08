'use client';

import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import type { AnalyticsRange, TopVideoRow } from '@/types/analytics';
import { Panel } from './Panel';
import { formatNumber } from '@/components/utils';

export default function TopVideosList({ range }: { range: AnalyticsRange }) {
  const state = useAnalytics<TopVideoRow[]>('top-videos', range);
  const videos = state.data ?? [];

  return (
    <Panel title="Top Videos" state={state} skeletonClass="h-64">
      {videos.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No data yet</p>
      ) : (
        <ul className="space-y-3">
          {videos.map((v, i) => (
            <li key={v.videoId} className="flex items-center gap-3">
              <span className="w-4 text-sm text-slate-500">{i + 1}</span>
              {/* plain <img> avoids next/image remote-domain config */}
              <img
                src={v.thumbnail}
                alt=""
                className="h-12 w-20 flex-shrink-0 rounded-md bg-slate-800 object-cover"
              />
              <p className="min-w-0 flex-1 truncate text-sm text-slate-200">
                {v.title}
              </p>
              <span className="text-sm font-medium text-slate-300">
                {formatNumber(v.views)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}