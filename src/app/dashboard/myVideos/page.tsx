'use client';

import ProfileVideos from '@/components/profile/ProfileVideos';
import { useSession } from 'next-auth/react';

export default function MyVideosPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Videos</h1>
        <p className="mt-1 text-sm text-slate-400">Everything you've uploaded.</p>
      </header>

      {userId && <ProfileVideos userId={userId} />}
    </main>
  );
}