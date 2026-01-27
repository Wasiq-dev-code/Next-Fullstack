'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function SettingsSidebar({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'block rounded px-3 py-2 text-sm transition',
        isActive
          ? 'bg-muted font-medium'
          : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {title}
    </Link>
  );
}
