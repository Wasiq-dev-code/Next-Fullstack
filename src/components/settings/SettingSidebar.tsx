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
        'block rounded-lg px-3 py-2 text-sm transition-colors duration-150',
        isActive
          ? 'bg-purple-600 text-white font-medium shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      )}
    >
      {title}
    </Link>
  );
}