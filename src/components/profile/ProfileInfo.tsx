'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/Api-client/api-client';
import type { Profile, ProfileResponse } from '@/types/profile';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PrivateProfile from '@/app/profile/private/page';
import Image from 'next/image';

function getProfilePhotoUrl(profilePhoto: Profile['profilePhoto']) {
  const url =
    typeof profilePhoto === 'string' ? profilePhoto : profilePhoto?.url;
  return url?.trim() && url !== '/' ? url : null;
}

export default function ProfileInfo({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const user = session?.user.id;

  useEffect(() => {
    apiClient
      .profileInformation(userId)
      .then((res: ProfileResponse) => setProfile(res.profile))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!profile || isSubmitting || !user) return;

    setIsSubmitting(true);

    try {
      const response = await apiClient.toggleFollow(profile._id);

      setProfile((current) => {
        if (!current) return current;

        return {
          ...current,
          isFollowed: response.followed,
          followersCount: Math.max(
            0,
            current.followersCount + (response.followed ? 1 : -1),
          ),
        };
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#171922]">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="font-medium text-gray-400">Loading profile...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#171922] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#20222b] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/15">
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
          <h2 className="mb-2 text-2xl font-bold text-white">
            Profile not found
          </h2>
          <p className="text-gray-400">
            The user profile you are looking for does not exist.
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-[#171922] px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#20222b] shadow-xl shadow-black/30">
          {/* Profile Content */}
          <div className="relative px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            {/* Avatar */}
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative self-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#20222b] bg-linear-to-br from-violet-500 to-fuchsia-600 shadow-xl sm:h-28 sm:w-28 sm:border-6">
                  {getProfilePhotoUrl(profile.profilePhoto) ? (
                    <Image
                      src={getProfilePhotoUrl(profile.profilePhoto)!}
                      alt={profile.username}
                      fill
                      className="rounded-full object-cover"
                      sizes="(max-width: 640px) 80px, 112px"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white sm:text-4xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-3 border-[#20222b] bg-emerald-400 sm:bottom-1 sm:right-1 sm:h-6 sm:w-6"></div>
              </div>

              {/* Follow Button */}
              {!profile.isMe && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFollowToggle}
                  className="w-full rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70 sm:mb-1 sm:w-auto"
                >
                  {isSubmitting
                    ? 'Please wait...'
                    : profile.isFollowed
                      ? 'Unfollow'
                      : 'Follow'}
                </button>
              )}
              {user === profile._id && (
                <div className="flex w-full flex-col gap-2 sm:mb-1 sm:w-auto sm:flex-row">
                  <Link href="/profile/edit" className="w-full sm:w-auto">
                    <span className="block rounded-lg bg-violet-600 px-5 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500">
                      Edit profile
                    </span>
                  </Link>
                  <PrivateProfile />
                </div>
              )}
            </div>

            {/* Username and Bio Section */}
            <div className="mb-5">
              <h1 className="mb-1 break-words text-2xl font-bold text-white sm:text-3xl">
                {profile.username}
              </h1>
              <p className="text-sm text-gray-400 sm:text-base">
                @{profile.username.toLowerCase()}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 border-y border-white/10 py-4 sm:py-5">
              <div className="group cursor-pointer text-center">
                <div className="mb-1 text-xl font-bold text-white transition-colors group-hover:text-violet-300 sm:text-2xl">
                  {profile.postsCount}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-sm">
                  Posts
                </div>
              </div>

              <div className="group cursor-pointer border-x border-white/10 text-center">
                <div className="mb-1 text-xl font-bold text-white transition-colors group-hover:text-violet-300 sm:text-2xl">
                  {profile.followersCount}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-sm">
                  Followers
                </div>
              </div>

              <div className="group cursor-pointer text-center">
                <div className="mb-1 text-xl font-bold text-white transition-colors group-hover:text-violet-300 sm:text-2xl">
                  {profile.followToCount}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-sm">
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
