'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationItem } from '@/types/notification';
import { timeAgo } from '@/lib/notification/timeAgo';

interface Props {
  notification: NotificationItem;
  onOpen: (n: NotificationItem) => void;
}

export default function NotificationRow({ notification: n, onOpen }: Props) {
  const name = n.sender?.username ?? 'Someone';

  return (
    <Link
      // Adjust if your watch page lives somewhere else
      href={n.video ? `/videos/${n.video}` : '#'}
      onClick={() => onOpen(n)}
      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${
        n.isRead ? '' : 'bg-violet-600/10'
      }`}
    >
      <Avatar className="h-9 w-9 shrink-0 border border-violet-500">
        <AvatarImage src={n.sender?.profilePhoto?.url ?? ''} />
        <AvatarFallback className="bg-violet-600 text-white">
          {name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-gray-300">
          <span className="font-medium text-white">{name}</span> uploaded:{' '}
          {n.title}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{timeAgo(n.createdAt)}</p>
      </div>

      {n.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={n.thumbnailUrl}
          alt=""
          className="h-14 w-24 shrink-0 rounded-md border border-white/10 object-cover"
        />
      )}

      {!n.isRead && (
        <span
          aria-label="Unread"
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500"
        />
      )}
    </Link>
  );
}