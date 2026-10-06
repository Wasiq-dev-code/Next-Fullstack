
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/Api-client/api-client';
import { Button } from '@/components/ui/button';
import NotificationRow from '@/components/notification/notificationRow';
import { NotificationItem } from '@/types/notification';

type Filter = 'all' | 'unread';

const NOTIFICATIONS_CHANGED = 'notifications-changed';

const notifyChanged = () =>
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cursorRef = useRef<string | null>(null);

  const loadNotifications = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      setError(false);

      try {
        const res = await apiClient.fetchNotifications(
          reset ? null : cursorRef.current,
          filter === 'unread',
        );

        setItems((prev) =>
          reset ? res.notifications : [...prev, ...res.notifications],
        );

        cursorRef.current = res.nextCursor;
        setHasMore(!!res.nextCursor);
        setUnread(res.unreadCount);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }

    if (status === 'authenticated') {
      cursorRef.current = null;
      loadNotifications(true);
    }
  }, [status, loadNotifications, router]);

  // Header bell marked something as read
  useEffect(() => {
    const onChanged = () => {
      apiClient
        .fetchNotifications(null, false, 1)
        .then((res) => setUnread(res.unreadCount))
        .catch(() => {});
    };

    window.addEventListener(NOTIFICATIONS_CHANGED, onChanged);

    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED, onChanged);
    };
  }, []);

  const handleOpenItem = (n: NotificationItem) => {
    if (n.isRead) return;

    setItems((prev) =>
      prev.map((i) =>
        i._id === n._id
          ? {
              ...i,
              isRead: true,
            }
          : i,
      ),
    );

    setUnread((c) => Math.max(0, c - 1));

    apiClient
      .markNotificationsRead({ ids: [n._id] })
      .then(notifyChanged)
      .catch(() => {});
  };

  const handleMarkAll = async () => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        isRead: true,
      })),
    );

    setUnread(0);

    try {
      await apiClient.markNotificationsRead({ all: true });
      notifyChanged();
    } catch {
      loadNotifications(true);
    }
  };

  return (
    <section>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Your latest activity and updates.
          </p>

          {unread > 0 && (
            <span className="mt-2 inline-block rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">
              {unread} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
            {(['all', 'unread'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mark all */}
          <button
            onClick={handleMarkAll}
            disabled={unread === 0}
            className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-8 text-center text-sm text-slate-400">
          Could not load notifications.{' '}
          <button
            onClick={() => loadNotifications(items.length === 0)}
            className="text-purple-400 hover:text-purple-300"
          >
            Try again
          </button>
        </div>
      )}

      {/* Notification list */}
      {!error && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {items.map((notification) => (
            <NotificationRow
              key={notification._id}
              notification={notification}
              onOpen={handleOpenItem}
            />
          ))}

          {/* Loading */}
          {loading && (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              Loading notifications...
            </div>
          )}

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400">
                {filter === 'unread'
                  ? "You're all caught up."
                  : 'No notifications yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && !error && (
        <div className="mt-4 flex justify-center">
          <Button
            size="sm"
            onClick={() => loadNotifications(false)}
            className="cursor-pointer bg-purple-600 text-white hover:bg-purple-500"
          >
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}

