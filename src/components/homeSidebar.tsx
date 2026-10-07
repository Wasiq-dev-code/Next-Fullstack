'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, History, ThumbsUp, ListVideo } from 'lucide-react';
import { useSidebar } from '@/components/sidebarContext';

const items = [
  { title: 'Home',          href: '/',              icon: Home },
  { title: 'Subscriptions', href: '/subscriptions', icon: Users },
  { title: 'History',       href: '/history',       icon: History },
  { title: 'Liked Videos',  href: '/liked',         icon: ThumbsUp },
  { title: 'Playlists',     href: '/playlists',     icon: ListVideo },
];

export default function ViewerSidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile } = useSidebar();

  // close the mobile drawer after navigating
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const renderNav = (compact: boolean) => (
    <nav className="space-y-1">
      {items.map(({ title, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          title={title}
          className={`flex rounded-lg text-sm font-medium transition-colors ${
            compact
              ? 'flex-col items-center gap-1 px-1 py-3 text-[10px]'
              : 'items-center gap-4 px-3 py-2.5'
          } ${
            isActive(href)
              ? 'bg-slate-800 text-white'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Icon className="h-5 w-5" />
          {title}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: full sidebar or icon rail */}
      <aside
        className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950 p-3 transition-[width] duration-200 md:block ${
          collapsed ? 'w-[76px]' : 'w-60'
        }`}
      >
        {renderNav(collapsed)}
      </aside>

      {/* Mobile: slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobile} />
          <aside className="relative h-full w-64 overflow-y-auto border-r border-slate-800 bg-slate-950 p-3">
            {renderNav(false)}
          </aside>
        </div>
      )}
    </>
  );
}