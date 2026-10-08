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
  { key: 'watchMinutes', label: 'Watch time' },
  { key: 'newFollowers', label: 'New followers' },
];

export default function MetricEvolutionChart({
  daily,
}: {
  daily: DailyPoint[];
}) {
  const [metric, setMetric] = useState<Metric>('views');

  const activeMetric = METRICS.find((m) => m.key === metric)!;

  const data = useMemo(
    () =>
      daily.map((d) => ({
        ...d,
        watchMinutes: Math.round(d.watchSeconds / 60),
      })),
    [daily],
  );

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-800/80 bg-slate-950 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-800/80 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white">
              Metric evolution
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Track how your audience and content performance change over time
            </p>
          </div>

          {/* Metric selector */}
          <div className="flex w-fit rounded-lg border border-slate-800 bg-slate-900 p-1">
            {METRICS.map((m) => {
              const active = metric === m.key;

              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMetric(m.key)}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
                    active
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300',
                  ].join(' ')}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="min-h-[340px] flex-1 px-4 pb-5 pt-6 sm:px-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 8,
              right: 12,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="metricEvolutionFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#38bdf8"
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor="#38bdf8"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.65}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatDay(d)}
              tick={{
                fill: '#64748b',
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={32}
              dy={10}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: '#64748b',
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              width={42}
              tickMargin={8}
            />

            <Tooltip
              cursor={{
                stroke: '#475569',
                strokeDasharray: '4 4',
              }}
              contentStyle={{
                background: '#020617',
                border: '1px solid #334155',
                borderRadius: 10,
                padding: '10px 12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              }}
              labelStyle={{
                color: '#94a3b8',
                fontSize: 11,
                marginBottom: 4,
              }}
              itemStyle={{
                color: '#f8fafc',
                fontSize: 13,
                fontWeight: 600,
              }}
              labelFormatter={(d) => formatDay(String(d), true)}
              formatter={(value) => [
                Number(value).toLocaleString(),
                activeMetric.label,
              ]}
            />

            <Area
              type="monotone"
              dataKey={metric}
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#metricEvolutionFill)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#38bdf8',
                stroke: '#020617',
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

