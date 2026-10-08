'use client';

import type { AnalyticsRange } from '@/types/analytics';

const OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '28d', label: '28 days' },
  { value: '90d', label: '90 days' },
];

interface Props {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}

export default function RangeSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.value
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}