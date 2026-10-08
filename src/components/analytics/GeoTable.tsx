'use client';

import { useMemo, useState } from 'react';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import type { AnalyticsRange, CityRow, CountryRow } from '@/types/analytics';
import { Panel } from './Panel';
import { countryName, formatDuration, formatNumber } from '@/components/utils';

interface Row {
  key: string;
  label: string;
  secondary?: string;
  views: number;
  watchSeconds: number;
}

type SortKey = 'views' | 'watchSeconds';

export default function GeoTable({
  range,
  type,
}: {
  range: AnalyticsRange;
  type: 'countries' | 'cities';
}) {
  const isCities = type === 'cities';
  const state = useAnalytics<(CountryRow | CityRow)[]>(type, range);
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: 'views',
    desc: true,
  });

  const rows: Row[] = useMemo(() => {
    const mapped = (state.data ?? []).map((r) =>
      isCities
        ? {
            key: `${(r as CityRow).city}-${r.country}`,
            label: (r as CityRow).city || 'Unknown',
            secondary: countryName((r as CityRow).country),
            views: r.views,
            watchSeconds: r.watchSeconds,
          }
        : {
            key: (r as CountryRow).country || 'unknown',
            label: countryName((r as CountryRow).country),
            views: r.views,
            watchSeconds: r.watchSeconds,
          },
    );
    return mapped.sort((a, b) =>
      sort.desc ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key],
    );
  }, [state.data, isCities, sort]);

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: true }));

  const SortHeader = ({ k, children }: { k: SortKey; children: string }) => (
    <th className="pb-2 text-right font-medium">
      <button
        onClick={() => toggle(k)}
        className="inline-flex items-center gap-1 uppercase hover:text-white"
      >
        {children}
        {sort.key === k && <span>{sort.desc ? '▼' : '▲'}</span>}
      </button>
    </th>
  );

  return (
    <Panel
      title={isCities ? 'Top Cities' : 'Top Countries'}
      state={state}
      skeletonClass="h-72"
    >
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No data yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">{isCities ? 'City' : 'Country'}</th>
                {isCities && <th className="pb-2 font-medium">Country</th>}
                <SortHeader k="views">Views</SortHeader>
                <SortHeader k="watchSeconds">Watch Time</SortHeader>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-slate-800/60 last:border-0">
                  <td className="py-2.5 pr-3 text-sky-400">{r.label}</td>
                  {isCities && (
                    <td className="py-2.5 pr-3 font-medium text-slate-200">
                      {r.secondary}
                    </td>
                  )}
                  <td className="py-2.5 text-right text-slate-300">
                    {formatNumber(r.views)}
                  </td>
                  <td className="whitespace-nowrap py-2.5 text-right text-slate-300">
                    {formatDuration(r.watchSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}