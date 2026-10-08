
import type { DailyPoint } from '@/types/analytics';
import {
  formatDay,
  formatDuration,
  formatNumber,
} from '@/components/utils';

export default function TimeTrendsTable({
  daily,
}: {
  daily: DailyPoint[];
}) {
  const rows = [...daily].reverse();

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      {/* Table header */}
      <div className="border-b border-slate-800 px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight text-white">
          Time trends
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40">
                <th className="sticky left-0 z-20 bg-slate-900/95 px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Day
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Views
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Unique viewers
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Logged out
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Watch time
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  New followers
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((day) => (
                <tr
                  key={day.date}
                  className="border-b border-slate-800/60 transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="sticky left-0 bg-slate-950 px-6 py-4 text-sm font-medium text-slate-200">
                    {formatDay(day.date)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-white">
                    {formatNumber(day.views)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm tabular-nums text-slate-400">
                    {formatNumber(day.uniqueViewers)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm tabular-nums text-slate-400">
                    {formatNumber(day.loggedOutViewers)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm tabular-nums text-slate-400">
                    {formatDuration(day.watchSeconds)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-medium tabular-nums text-slate-300">
                    {formatNumber(day.newFollowers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

