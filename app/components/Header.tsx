'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  const isAuth = status === 'authenticated' && !!session?.user;

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold"></div>
            <span className="font-semibold text-slate-900 text-lg">Home</span>
          </Link>
        </div>

        <div className="flex-1">
          {/* <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!query) return;
              window.location.href = `/search?query=${encodeURIComponent(query)}`;
            }}
            className="max-w-xl mx-auto"
          >
            {/* <label className="relative block">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos, users..."
                className="w-full rounded-full border border-slate-200 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </label> */}
          {/* </form> */}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/videos/registerVideo"
            className="hidden sm:inline-flex px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-md"
          >
            Upload
          </Link>

          {isAuth ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="flex items-center gap-2 rounded-full focus:outline-none"
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'avatar'}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                    {(session?.user?.name || 'U')[0]}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1">
                  <Link
                    href={`/profile/${session?.user?.id ?? ''}`}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => signIn()}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:underline"
              >
                Log in
              </button>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
