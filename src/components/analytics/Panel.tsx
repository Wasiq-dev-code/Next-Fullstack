
'use client';

import { ReactNode } from 'react';

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
      <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
        <div className="flex flex-wrap items-center gap-2">
          <span>{state.error}</span>

          <button
            type="button"
            onClick={state.retry}
            className="font-medium text-red-200 underline underline-offset-2 transition-colors hover:text-white"
          >
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
          'bg-slate-800/50',
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
        state.loading ? 'opacity-60' : 'opacity-100',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/**
 * Reusable analytics card.
 *
 * The panel does not control the height of its content.
 * Its height is determined naturally by whatever is inside it.
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
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40 shadow-sm">
      {/* Header */}
      <div className="flex min-h-14 items-center justify-between gap-4 border-b border-slate-800/70 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-100">
          {title}
        </h2>

        {actions && (
          <div className="shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 p-5">
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

