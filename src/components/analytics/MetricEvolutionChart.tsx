'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyPoint } from '@/types/analytics';
import { formatDay } from '@/components/utils';

type Metric =
  | 'views'
  | 'uniqueViewers'
  | 'loggedOutViewers'
  | 'watchMinutes'
  | 'newFollowers';

const METRICS: { key: Metric; label: string }[] = [
  { key: 'views', label: 'Views' },
  { key: 'uniqueViewers', label: 'Unique viewers' },
  { key: 'loggedOutViewers', label: 'Logged out' },
  { key: 'watchMinutes', label: 'Watch time (min)' },
  { key: 'newFollowers', label: 'New followers' },
];

export default function MetricEvolutionChart({ daily }: { daily: DailyPoint[] }) {
  const [metric, setMetric] = useState<Metric>('views');
  const label = METRICS.find((m) => m.key === metric)!.label;

  const data = useMemo(
    () =>
      daily.map((d) => ({
        ...d,
        watchMinutes: Math.round(d.watchSeconds / 60),
      })),
    [daily],
  );

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">Metric Evolution</h2>
        <div className="flex flex-wrap gap-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                metric === m.key
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[320px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatDay(d)}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#fff',
              }}
              labelFormatter={(d) => formatDay(String(d), true)}
              formatter={(value) => [value, label]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#metricFill)"
              dot={{ r: 2, fill: '#38bdf8', strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}