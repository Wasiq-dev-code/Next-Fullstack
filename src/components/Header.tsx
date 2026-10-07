'use client';

import Link from 'next/link';
import { Menu, Upload, User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchBar } from './feed/SearchBar';
import { usePathname, useRouter } from 'next/navigation';
import NotificationBell from './notification/notificationBell';
import { useSidebar } from '@/components/sidebarContext';

const BRAND = 'Echo'; // change to your product name

const menuItemClass =
  'flex cursor-pointer items-center gap-2.5 text-gray-300 focus:bg-white/5 focus:text-white';

export default function Header() {
  const { data: session, status } = useSession();
  const isAuth = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';
  const pathname = usePathname();
  const router = useRouter();
  const { toggle } = useSidebar();

  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/verify/')
  ) {
    return null;
  }

  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#171922]">
      <div className="flex h-full items-center gap-4 px-4 lg:gap-8 lg:px-6">
        {/* Left: hamburger + brand */}
        <div className="flex shrink-0 items-center gap-2 ">
          {/* <button
            onClick={toggle}
            aria-label="Toggle sidebar"
            className="cursor-pointer rounded-full p-2.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Menu className="h-5 w-5" />
          </button> */}

          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-base font-bold text-white shadow-md shadow-violet-950/40 ml-3">
              N
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              {BRAND}
            </span>
          </Link>
        </div>

        {/* Center: search fills the space between left and right */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-3xl">
            <SearchBar
              onSearch={(query) => {
                const q = query.trim();
                if (!q) return;
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }}
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center justify-end gap-3">
          {isLoading ? (
            // skeleton avoids flashing "Log in / Sign up" before the session loads
            <div className="flex items-center gap-3">
              <div className="h-9 w-28 animate-pulse rounded-lg bg-white/10" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
            </div>
          ) : isAuth ? (
            <>
              <Link href="/videos/registerVideo" aria-label="Upload video">
                <Button
                  size="sm"
                  className="h-9 cursor-pointer gap-2 bg-violet-600 px-4 text-white shadow-md shadow-violet-950/30 hover:bg-violet-500"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </Link>

              {/* Has its own DropdownMenu: keep it as a sibling, not nested */}
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <Avatar className="h-9 w-9 cursor-pointer border border-violet-500/70 transition hover:border-violet-400">
                      <AvatarImage src={user?.image ?? undefined} />
                      <AvatarFallback className="bg-violet-600 text-white">
                        {(user?.name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-60 border border-white/10 bg-[#20222b] p-1.5 shadow-xl shadow-black/40"
                >
                  <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                    <p className="truncate text-sm font-semibold text-white">
                      {user?.name ?? 'Account'}
                    </p>
                    {user?.email && (
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-white/10" />

                  {user?.id && (
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.id}`} className={menuItemClass}>
                        <User className="h-4 w-4" />
                        Your profile
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className={menuItemClass}>
                      <LayoutDashboard className="h-4 w-4" />
                      Creator dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/profile" className={menuItemClass}>
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex cursor-pointer items-center gap-2.5 text-red-400 focus:bg-white/5 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signIn()}
                className="cursor-pointer text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Log in
              </Button>
              <Link href="/register">
                <Button
                  size="sm"
                  className="cursor-pointer bg-violet-600 text-white hover:bg-violet-500"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}