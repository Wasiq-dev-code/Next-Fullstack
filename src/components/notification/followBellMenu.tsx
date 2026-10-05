'use client';

import { useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { apiClient } from '@/lib/Api-client/api-client'; // <- adjust to where your apiClient lives
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type NotificationLevel = 'ALL' | 'NONE';

interface Props {
  accountId: string;
  initialLevel?: NotificationLevel;
}

const OPTIONS: { value: NotificationLevel; label: string }[] = [
  { value: 'ALL', label: 'All uploads' },
  { value: 'NONE', label: 'None' },
];

// Render only when the viewer follows this account
export default function FollowBellMenu({ accountId, initialLevel = 'ALL' }: Props) {
  const [level, setLevel] = useState<NotificationLevel>(initialLevel);
  const [saving, setSaving] = useState(false);

  const choose = async (next: NotificationLevel) => {
    if (next === level || saving) return;
    const prev = level;
    setLevel(next); // optimistic
    setSaving(true);
    try {
      await apiClient.setFollowNotificationLevel(accountId, next);
    } catch {
      setLevel(prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notification settings for this account"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-300 transition-colors hover:cursor-pointer hover:bg-white/10 hover:text-white focus:outline-none"
        >
          {level === 'ALL' ? (
            <Bell className="h-4 w-4 text-violet-400" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 border border-white/10 bg-[#20222b]"
      >
        {OPTIONS.map((o) => (
          <DropdownMenuItem
            key={o.value}
            onClick={() => choose(o.value)}
            className="justify-between text-gray-300 focus:bg-white/5 focus:text-white"
          >
            {o.label}
            {level === o.value && <Check className="h-4 w-4 text-violet-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}