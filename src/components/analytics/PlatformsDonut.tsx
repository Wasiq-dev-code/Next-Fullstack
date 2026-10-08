'use client';

import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import type { AnalyticsRange, NamedCount } from '@/types/analytics';
import { Panel } from './Panel';
import { formatNumber } from '@/components/utils';

const COLORS = [
  '#38bdf8', '#fb923c', '#a78bfa', '#34d399', '#facc15',
  '#f472b6', '#60a5fa', '#4ade80', '#f87171', '#94a3b8',
];

export default function PlatformsDonut({ range }: { range: AnalyticsRange }) {
  const [by, setBy] = useState<'device' | 'browser'>('device');
  const state = useAnalytics<NamedCount[]>('platforms', range, { by });

  const data = (state.data ?? []).map((d) => ({
    ...d,
    name: by === 'device' ? d.name.charAt(0).toUpperCase() + d.name.slice(1) : d.name,
  }));
  const total = data.reduce((s, d) => s + d.views, 0);

  const tabs = (
    <div className="flex gap-1">
      {(['device', 'browser'] as const).map((t) => (
        <button
          key={t}
          onClick={() => setBy(t)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
            by === t ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <Panel title="Views (#) | ALL" actions={tabs} state={state} skeletonClass="h-72">
      {total === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No data yet</p>
      ) : (
        <>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="views"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 space-y-1.5">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {d.name}
                </span>
                <span className="text-slate-400">
                  {formatNumber(d.views)}{' '}
                  <span className="text-slate-500">
                    ({Math.round((d.views / total) * 100)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}