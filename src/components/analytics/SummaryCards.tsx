
import {
  Eye,
  Users,
  UserRoundCheck,
  Clock3,
  UserPlus,
} from 'lucide-react';

import type { AnalyticsSummary } from '@/types/analytics';
import { formatDuration, formatNumber } from '@/components/utils';

export default function SummaryCards({
  summary,
}: {
  summary: AnalyticsSummary;
}) {
  const cards = [
    {
      label: 'Unique viewers',
      value: formatNumber(summary.uniqueViewers),
      icon: Users,
      accent: 'text-sky-400',
      iconBg: 'bg-sky-400/10',
      primary: true,
    },
    {
      label: 'Logged out viewers',
      value: formatNumber(summary.loggedOutViewers),
      icon: UserRoundCheck,
      accent: 'text-violet-400',
      iconBg: 'bg-violet-400/10',
    },
    {
      label: 'Total views',
      value: formatNumber(summary.totalViews),
      icon: Eye,
      accent: 'text-emerald-400',
      iconBg: 'bg-emerald-400/10',
    },
    {
      label: 'Watch time',
      value: formatDuration(summary.watchSeconds),
      icon: Clock3,
      accent: 'text-amber-400',
      iconBg: 'bg-amber-400/10',
    },
    {
      label: 'New followers',
      value: formatNumber(summary.newFollowers),
      icon: UserPlus,
      accent: 'text-pink-400',
      iconBg: 'bg-pink-400/10',
    },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={[
              'group relative flex flex-1 overflow-hidden rounded-xl',
              'border border-slate-800 bg-slate-950',
              'px-5 transition-all duration-200',
              'hover:border-slate-700 hover:bg-slate-900/80',
              card.primary ? 'min-h-[132px]' : 'min-h-[92px]',
            ].join(' ')}
          >
            {/* subtle background glow */}
            {card.primary && (
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/5 blur-3xl" />
            )}

            <div className="relative flex w-full items-center justify-between">
              <div>
                <p
                  className={[
                    'font-semibold tracking-tight text-white',
                    card.primary ? 'text-3xl' : 'text-2xl',
                  ].join(' ')}
                >
                  {card.value}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  {card.label}
                </p>
              </div>

              <div
                className={[
                  'flex shrink-0 items-center justify-center rounded-lg',
                  card.primary ? 'h-11 w-11' : 'h-9 w-9',
                  card.iconBg,
                ].join(' ')}
              >
                <Icon
                  className={[
                    card.primary ? 'h-5 w-5' : 'h-4 w-4',
                    card.accent,
                  ].join(' ')}
                  strokeWidth={1.8}
                />
              </div>
            </div>

            {/* Primary metric accent */}
            {card.primary && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-sky-500/70 via-sky-500/20 to-transparent" />
            )}
          </div>
        );
      })}
    </div>
  );
}
