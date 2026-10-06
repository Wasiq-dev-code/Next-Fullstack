'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Video, BarChart3, Settings, Bell } from 'lucide-react';
import { settingsNav } from '@/lib/validations/SettingNav';

const items = [
  { title: 'Overview',  href: '/dashboard',           icon: LayoutDashboard },
  { title: 'My Videos', href: '/dashboard/videos',    icon: Video },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
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

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 sticky top-16 h-[calc(100vh-64px)] p-4">
      <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Dashboard
      </p>

      <nav className="space-y-1">
        {items.map(({ title, href, icon: Icon }) => {
          const active =
            href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={linkClass(active)}>
              <Icon className="h-4 w-4" />
              {title}
            </Link>
          );
        })}

        {/* Settings group */}
        <Link
          href="/dashboard/settings/profile"
          className={linkClass(inSettings)}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {inSettings && (
          <div className="ml-5 mt-1 space-y-1 border-l border-slate-800 pl-3">
            {settingsNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'text-purple-300 font-medium'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}