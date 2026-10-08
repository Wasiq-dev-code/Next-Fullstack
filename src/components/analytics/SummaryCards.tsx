import type { AnalyticsSummary } from '@/types/analytics';
import { formatDuration, formatNumber } from '@/components/utils';

export default function SummaryCards({ summary }: { summary: AnalyticsSummary }) {
  const cards = [
    {
      label: 'Unique Viewers (#)',
      value: formatNumber(summary.uniqueViewers),
      primary: true,
    },
    { label: 'Logged Out Viewers (#)', value: formatNumber(summary.loggedOutViewers) },
    { label: 'Total Views (#)', value: formatNumber(summary.totalViews) },
    { label: 'Watch Time', value: formatDuration(summary.watchSeconds) },
    { label: 'New Followers (#)', value: formatNumber(summary.newFollowers) },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`flex flex-1 flex-col items-center justify-center rounded-xl border px-4 text-center ${
            c.primary
              ? 'min-h-[132px] border-teal-800/60 bg-gradient-to-br from-teal-900/70 to-sky-900/70'
              : 'min-h-[92px] border-slate-800 bg-slate-900'
          }`}
        >
          <p
            className={`font-bold text-white ${c.primary ? 'text-4xl' : 'text-2xl'}`}
          >
            {c.value}
          </p>
          <p className="mt-1.5 text-[11px] font-medium text-slate-300/80">
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}