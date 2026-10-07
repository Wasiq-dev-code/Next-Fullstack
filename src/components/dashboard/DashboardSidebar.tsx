'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Video, BarChart3, MessageSquare,
  Bell, Settings, ArrowLeft,
} from 'lucide-react';
import { settingsNav } from '@/lib/validations/SettingNav';

const items = [
  { title: 'Overview',      href: '/dashboard',              icon: LayoutDashboard },
  { title: 'My Videos',     href: '/dashboard/myVideos',       icon: Video },
  { title: 'Analytics',     href: '/dashboard/analytics',    icon: BarChart3 },
  { title: 'Comments',      href: '/dashboard/comments',     icon: MessageSquare },
  { title: 'Notifications', href: '/dashboard/notification', icon: Bell },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const inSettings = pathname.startsWith('/dashboard/settings');

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-purple-600/20 text-purple-300'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden md:block w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-slate-800 bg-slate-900/60 p-3 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Creator Studio
      </p>

      <nav className="space-y-1">
        {items.map(({ title, href, icon: Icon }) => (
          <Link key={href} href={href} className={linkClass(isActive(href))}>
            <Icon className="h-4 w-4" />
            {title}
          </Link>
        ))}

        <Link href="/dashboard/settings/profile" className={linkClass(inSettings)}>
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {inSettings && (
          <div className="ml-5 mt-1 space-y-1 border-l border-slate-800 pl-3">
            {settingsNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname === item.href
                    ? 'font-medium text-purple-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}