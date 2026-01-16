'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const settingsNav = [
  {
    title: 'Profile',
    href: '/settings/profile',
  },
  {
    title: 'Account',
    href: '/settings/account',
  },
  {
    title: 'Security',
    href: '/settings/security',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid grid-cols-[240px_1fr] gap-10">
        <aside className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">
            Settings
          </h2>

          {settingsNav.map((item) => (
            <SidebarLink key={item.href} href={item.href} title={item.title} />
          ))}
        </aside>

        <main className="bg-background border rounded-xl p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-muted font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {title}
    </Link>
  );
}
