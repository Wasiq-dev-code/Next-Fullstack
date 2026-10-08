'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface State {
  data: unknown | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Handles loading, error, and refreshing states.
 * Does not impose a fixed height on the actual content.
 */
export function AsyncBlock({
  state,
  skeletonClass = 'min-h-24',
  children,
}: {
  state: State;
  skeletonClass?: string;
  children: ReactNode;
}) {
  // Error state
  if (!state.data && state.error) {
    return (
      <div className="flex min-h-24 items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border border-red-500/10 bg-red-500/[0.04] px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />

          <span className="text-sm text-slate-400">
            {state.error}
          </span>

          <button
            type="button"
            onClick={state.retry}
            className="ml-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition-colors hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading / skeleton state
  if (!state.data) {
    return (
      <div
        className={[
          'w-full animate-pulse rounded-lg',
          'bg-gradient-to-r from-slate-800/40 via-slate-800/60 to-slate-800/40',
          skeletonClass,
        ].join(' ')}
        aria-hidden="true"
      />
    );
  }

  // Loaded state
  return (
    <div
      className={[
        'w-full min-w-0 transition-opacity duration-200',
        state.loading ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/**
 * Reusable analytics panel.
 *
 * Provides consistent dashboard framing while allowing
 * the content to determine its own height.
 */
export function Panel({
  title,
  actions,
  state,
  skeletonClass = 'min-h-24',
  children,
}: {
  title: string;
  actions?: ReactNode;
  state: State;
  skeletonClass?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 shadow-sm">
      {/* Header */}
      <header className="flex min-h-[64px] items-center justify-between gap-4 border-b border-slate-800/70 px-5 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center">
            {actions}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="min-w-0 p-5 sm:p-6">
        <AsyncBlock
          state={state}
          skeletonClass={skeletonClass}
        >
          {children}
        </AsyncBlock>
      </div>
    </section>
  );
}
