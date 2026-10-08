import type { DailyPoint } from '@/types/analytics';
import { formatDay, formatDuration, formatNumber } from '@/components/utils';

export default function TimeTrendsTable({ daily }: { daily: DailyPoint[] }) {
  const rows = [...daily].reverse(); // newest first

  const headers = [
    'Days',
    'Views (#)',
    'Unique Viewers (#)',
    'Logged Out Viewers (#)',
    'Watch Time',
    'New Followers (#)',
  ];

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 bg-slate-900">
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-300">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`pb-2 font-semibold ${i === 0 ? 'text-left' : 'text-center'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr
                key={d.date}
                className="border-b border-slate-800/60 last:border-0 odd:bg-slate-800/20"
              >
                <td className="px-1 py-2.5 text-slate-200">{formatDay(d.date)}</td>
                <td className="py-2.5 text-center text-slate-300">
                  {formatNumber(d.views)}
                </td>
                <td className="py-2.5 text-center text-slate-300">
                  {formatNumber(d.uniqueViewers)}
                </td>
                <td className="py-2.5 text-center text-slate-300">
                  {formatNumber(d.loggedOutViewers)}
                </td>
                <td className="py-2.5 text-center text-slate-300">
                  {formatDuration(d.watchSeconds)}
                </td>
                <td className="py-2.5 text-center text-slate-300">
                  {formatNumber(d.newFollowers)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}