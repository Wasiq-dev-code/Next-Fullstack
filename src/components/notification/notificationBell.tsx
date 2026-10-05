'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { apiClient } from '@/lib/Api-client/api-client'; // <- adjust to where your apiClient lives
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationItem } from '@/types/notification';
import NotificationRow from './notificationRow';
const NOTIFICATIONS_CHANGED = 'notifications-changed';
const notifyChanged = () =>
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
const POLL_MS = 60_000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Cheap badge refresh (limit=1, we only need unreadCount)
  const refreshCount = useCallback(async () => {
    try {
      const res = await apiClient.fetchNotifications(null, false, 1);
      setUnread(res.unreadCount);
    } catch {
      /* keep the last known count */
    }
  }, []);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiClient.fetchNotifications(null, false, 8);
      setItems(res.notifications);
      setUnread(res.unreadCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for the badge; skip while the tab is hidden
  useEffect(() => {
    refreshCount();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refreshCount();
    }, POLL_MS);
    const onChanged = () => refreshCount();
    window.addEventListener(NOTIFICATIONS_CHANGED, onChanged);
    return () => {
      clearInterval(id);
      window.removeEventListener(NOTIFICATIONS_CHANGED, onChanged);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (open) loadLatest();
  }, [open, loadLatest]);

  const handleOpenItem = (n: NotificationItem) => {
    setOpen(false);
    if (n.isRead) return;
    setItems((prev) =>
      prev.map((i) => (i._id === n._id ? { ...i, isRead: true } : i)),
    );
    setUnread((c) => Math.max(0, c - 1));
    apiClient
      .markNotificationsRead({ ids: [n._id] })
      .then(notifyChanged)
      .catch(() => refreshCount());
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
    try {
      await apiClient.markNotificationsRead({ all: true });
      notifyChanged();
    } catch {
      refreshCount();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
          }
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-300 transition-colors hover:cursor-pointer hover:bg-white/10 hover:text-white focus:outline-none"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[22rem] max-w-[calc(100vw-2rem)] border border-white/10 bg-[#20222b] p-0"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="text-sm font-semibold text-white">Notifications</span>
          <button
            onClick={handleMarkAll}
            disabled={unread === 0}
            className="text-xs text-violet-400 hover:text-violet-300 disabled:cursor-default disabled:text-gray-600"
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-96 divide-y divide-white/10 overflow-y-auto">
          {loading && items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Loading…
            </p>
          )}
          {error && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Could not load notifications.{' '}
              <button
                onClick={loadLatest}
                className="text-violet-400 hover:text-violet-300"
              >
                Try again
              </button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No notifications yet. New uploads from accounts you follow show up
              here.
            </p>
          )}
          {items.map((n) => (
            <NotificationRow
              key={n._id}
              notification={n}
              onOpen={handleOpenItem}
            />
          ))}
        </div>

        <Link
          href="/notification"
          onClick={() => setOpen(false)}
          className="block border-t border-white/10 px-4 py-2.5 text-center text-sm text-gray-300 hover:bg-white/5 hover:text-white"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}