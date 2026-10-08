
'use client';

import { ReactNode, useState } from 'react';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';
import type {
  AnalyticsRange,
  AnalyticsSummary,
  TimeseriesResponse,
} from '@/types/analytics';

import RangeSelector from '@/components/analytics/RangeSelector';
import SummaryCards from '@/components/analytics/SummaryCards';
import MetricEvolutionChart from '@/components/analytics/MetricEvolutionChart';
import PlatformsDonut from '@/components/analytics/PlatformsDonut';
import GeoTable from '@/components/analytics/GeoTable';
import TopVideosList from '@/components/analytics/TopVideosList';
import TimeTrendsTable from '@/components/analytics/TimeTrendsTable';
import { AsyncBlock } from '@/components/analytics/Panel';

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-slate-100">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function Panel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-xl',
        'border border-slate-800/80',
        'bg-slate-900/30',
        'shadow-sm',
        'min-w-0',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('28d');

  const summary = useAnalytics<AnalyticsSummary>(
    'summary',
    range
  );

  const series = useAnalytics<TimeseriesResponse>(
    'timeseries',
    range
  );

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Page Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Creator Studio
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Analytics
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Understand how your content is performing and where your
                audience is coming from.
              </p>
            </div>

            <div className="shrink-0">
              <RangeSelector
                value={range}
                onChange={setRange}
              />
            </div>
          </div>

          <div className="mt-6 h-px bg-slate-800/70" />
        </header>

        <div className="space-y-10">

          {/* =====================================================
              OVERVIEW
          ====================================================== */}
          <section>
            <SectionHeader
              title="Overview"
              description="Key performance metrics for the selected period."
            />

            <Panel className="p-4 sm:p-5">
              <AsyncBlock
                state={summary}
                skeletonClass="min-h-[120px]"
              >
                {summary.data && (
                  <SummaryCards summary={summary.data} />
                )}
              </AsyncBlock>
            </Panel>
          </section>

          {/* =====================================================
              PERFORMANCE
          ====================================================== */}
          <section>
            <SectionHeader
              title="Performance"
              description="Track your channel performance over time."
            />

            <Panel className="p-4 sm:p-6">
              <AsyncBlock
                state={series}
                skeletonClass="min-h-[280px]"
              >
                {series.data && (
                  <div className="w-full min-w-0">
                    <MetricEvolutionChart
                      daily={series.data.daily}
                    />
                  </div>
                )}
              </AsyncBlock>
            </Panel>
          </section>

          {/* =====================================================
              AUDIENCE
          ====================================================== */}
          <section>
            <SectionHeader
              title="Audience"
              description="Understand the devices and locations your viewers use."
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

              {/* Devices */}
              <Panel className="p-5 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Devices
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Viewer device distribution
                  </p>
                </div>

                <div className="min-w-0">
                  <PlatformsDonut range={range} />
                </div>
              </Panel>

              {/* Geography */}
              <Panel className="p-5 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Geography
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Top locations of your viewers
                  </p>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-medium text-slate-300">
                        Cities
                      </h4>

                      <span className="text-[10px] uppercase tracking-wide text-slate-600">
                        Top
                      </span>
                    </div>

                    <GeoTable
                      range={range}
                      type="cities"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-xs font-medium text-slate-300">
                        Countries
                      </h4>

                      <span className="text-[10px] uppercase tracking-wide text-slate-600">
                        Top
                      </span>
                    </div>

                    <GeoTable
                      range={range}
                      type="countries"
                    />
                  </div>
                </div>
              </Panel>

            </div>
          </section>

          {/* =====================================================
              CONTENT
          ====================================================== */}
          <section>
            <SectionHeader
              title="Content Performance"
              description="Your best-performing videos during the selected period."
            />

            <Panel className="overflow-hidden">
              <div className="p-4 sm:p-6">
                <TopVideosList range={range} />
              </div>
            </Panel>
          </section>

          {/* =====================================================
              TIME TRENDS
          ====================================================== */}
          <section>
            <SectionHeader
              title="Time Trends"
              description="Daily performance throughout the selected period."
            />

            <Panel className="overflow-hidden">
              <div className="p-4 sm:p-6">
                <AsyncBlock
                  state={series}
                  skeletonClass="min-h-[200px]"
                >
                  {series.data && (
                    <div className="w-full min-w-0 overflow-x-auto">
                      <TimeTrendsTable
                        daily={series.data.daily}
                      />
                    </div>
                  )}
                </AsyncBlock>
              </div>
            </Panel>
          </section>

        </div>
      </div>
    </main>
  );
}

