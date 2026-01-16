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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-black">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-200 text-sm font-semibold text-black">
            N
          </div>
          <span className="text-base font-semibold text-slate-200">Home</span>
        </Link>

        <div className="flex-1" />

        {isAuth ? (
          <div className="flex items-center gap-3">
            <Link
              href="/videos/registerVideo"
              className="hidden sm:inline-flex"
            >
              <Button size="sm">Video Upload</Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image ?? ''} />
                    <AvatarFallback className="bg-slate-700 text-slate-200">
                      {(session.user?.name || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 border border-slate-700 bg-gray-100 hover:bg-slate-500"
              >
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${session.user?.id ?? ''}`}>
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-slate-700 focus:bg-slate-50"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => signIn()}>
              Log in
            </Button>

            <Link href="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
