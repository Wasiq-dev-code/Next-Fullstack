'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/src/lib/api-client';
import type { Profile, ProfileResponse } from '@/src/lib/types/profile';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PrivateProfile from '../private/page';

export default function ProfileInfo({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const user = session?.user.id;

  useEffect(() => {
    apiClient
      .profileInformation(userId)
      .then((res: ProfileResponse) => setProfile(res.profile))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading profile…</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Profile not found
          </h2>
          <p className="text-slate-500">
            The user profile youre looking for doesnt exist.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Background */}
          <div className="h-48 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-between items-start -mt-20 mb-6">
              <div className="relative">
                <div className="w-40 h-40 bg-linear-to-br from-blue-400 to-purple-600 rounded-full border-8 border-white shadow-2xl flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>

              {/* Follow Button */}
              {!profile.isMe && (
                <button className="mt-16 px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  {profile.isFollowed ? 'Unfollow' : 'Follow'}
                </button>
              )}
              {user === profile._id && (
                <>
                  <Link href={`/profile/edit`}>
                    <button className="mt-16 px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      Edit profile
                    </button>
                  </Link>

                  <PrivateProfile />
                </>
              )}
            </div>

            {/* Username and Bio Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {profile.username}
              </h1>
              <p className="text-slate-500 text-lg">
                @{profile.username.toLowerCase()}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-slate-200">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {profile.postsCount}
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Posts
                </div>
              </div>

              <div className="text-center group cursor-pointer border-x border-slate-200">
                <div className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                  {profile.followersCount}
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Followers
                </div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-slate-900 mb-1 group-hover:text-pink-600 transition-colors">
                  {profile.followToCount}
                </div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Following
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
