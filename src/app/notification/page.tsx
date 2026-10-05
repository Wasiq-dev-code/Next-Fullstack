'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/Api-client/api-client'; // <- adjust to where your apiClient lives
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

  const load = useCallback(
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
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated') load(true);
  }, [status, load, router]);

  // Header bell marked something as read
  useEffect(() => {
    const onChanged = () => {
      apiClient
        .fetchNotifications(null, false, 1)
        .then((res) => setUnread(res.unreadCount))
        .catch(() => {});
    };
    window.addEventListener(NOTIFICATIONS_CHANGED, onChanged);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, onChanged);
  }, []);

  const handleOpenItem = (n: NotificationItem) => {
    if (n.isRead) return;
    setItems((prev) =>
      prev.map((i) => (i._id === n._id ? { ...i, isRead: true } : i)),
    );
    setUnread((c) => Math.max(0, c - 1));
    apiClient
      .markNotificationsRead({ ids: [n._id] })
      .then(notifyChanged)
      .catch(() => {});
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
    try {
      await apiClient.markNotificationsRead({ all: true });
      notifyChanged();
    } catch {
      load(true);
    }
  };

  const tabClass = (active: boolean) =>
    active
      ? 'bg-violet-600 text-white hover:bg-violet-500'
      : 'text-gray-300 hover:bg-white/10 hover:text-white';

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-white">Notifications</h1>
        {unread > 0 && (
          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
            {unread} unread
          </span>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('all')}
          className={`cursor-pointer ${tabClass(filter === 'all')}`}
        >
          All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('unread')}
          className={`cursor-pointer ${tabClass(filter === 'unread')}`}
        >
          Unread
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAll}
          disabled={unread === 0}
          className="cursor-pointer text-gray-300 hover:bg-white/10 hover:text-white"
        >
          Mark all as read
        </Button>
      </div>

      <div className="divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-[#20222b]">
        {items.map((n) => (
          <NotificationRow key={n._id} notification={n} onOpen={handleOpenItem} />
        ))}

        {loading && (
          <p className="px-4 py-8 text-center text-sm text-gray-500">Loading…</p>
        )}

        {error && !loading && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Could not load notifications.{' '}
            <button
              onClick={() => load(items.length === 0)}
              className="text-violet-400 hover:text-violet-300"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-gray-500">
            {filter === 'unread'
              ? 'You are all caught up.'
              : 'No notifications yet. When accounts you follow upload a video, it will show up here.'}
          </p>
        )}
      </div>

      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <Button
            size="sm"
            onClick={() => load(false)}
            className="cursor-pointer bg-violet-600 text-white hover:bg-violet-500"
          >
            Load more
          </Button>
        </div>
      )}
    </main>
  );
}