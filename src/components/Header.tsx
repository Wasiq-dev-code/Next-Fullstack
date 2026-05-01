'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Header() {
  const { data: session, status } = useSession();
  const isAuth = status === 'authenticated' && !!session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e0f11]">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-600 text-sm font-semibold text-white">
            N
          </div>
          <span className="text-base font-semibold text-white">Home</span>
        </Link>

        <div className="flex-1" />

        {isAuth ? (
          <div className="flex items-center gap-3">
            <Link
              href="/videos/registerVideo"
              className="hidden sm:inline-flex"
            >
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                Video Upload
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image ?? ''} />
                    <AvatarFallback className="bg-violet-600 text-white">
                      {(session.user?.name || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 border border-white/10 bg-[#16171a]"
              >
                {status === 'authenticated' && session?.user?.id && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="text-gray-300 focus:bg-white/5 focus:text-white"
                    >
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile/edit"
                    className="text-gray-300 focus:bg-white/5 focus:text-white"
                  >
                    Edit Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-400 focus:bg-white/5 focus:text-red-300"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signIn()}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              Log in
            </Button>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
