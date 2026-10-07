'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { Check, Link2, Pencil, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/Api-client/api-client';
import type { Profile, ProfileResponse } from '@/types/profile';

type ExtendedProfile = Profile & {
  bio?: string;
  coverPhoto?: string | { url?: string };
};

const BG = '#171922';
const BANNER_HEIGHT = 176;
const AVATAR_SIZE = 112;
const compact = new Intl.NumberFormat(undefined, { notation: 'compact' });

function getImageUrl(value?: string | { url?: string } | null) {
  const url = typeof value === 'string' ? value : value?.url;
  return url?.trim() && url !== '/' ? url : null;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl bg-white/5" style={{ height: BANNER_HEIGHT }} />
      <div
        className="flex items-end gap-5"
        style={{ marginTop: -AVATAR_SIZE / 2, paddingLeft: 24, paddingRight: 24 }}
      >
        <div
          className="rounded-full bg-white/10"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            border: `4px solid ${BG}`,
          }}
        />
        <div className="mb-2 space-y-2">
          <div className="h-6 w-48 rounded bg-white/10" />
          <div className="h-4 w-32 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileInfo({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const user = session?.user?.id;

  useEffect(() => {
    apiClient
      .profileInformation(userId)
      .then((res: ProfileResponse) => setProfile(res.profile as ExtendedProfile))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user) return signIn();
    if (!profile || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.toggleFollow(profile._id);
      setProfile((current) =>
        current
          ? {
              ...current,
              isFollowed: response.followed,
              followersCount: Math.max(
                0,
                current.followersCount + (response.followed ? 1 : -1),
              ),
            }
          : current,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading) return <ProfileSkeleton />;

  if (!profile)
    return (
      <div className="rounded-2xl border border-white/10 bg-[#20222b] p-10 text-center">
        <h2 className="text-2xl font-bold text-white">Profile not found</h2>
        <p className="mt-2 text-gray-400">
          The user profile you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Back to home
        </Link>
      </div>
    );

  const avatarUrl = getImageUrl(profile.profilePhoto);
  const coverUrl = getImageUrl(profile.coverPhoto);
  const isOwner = !!profile.isMe || user === profile._id;

  const stats = [
    { label: 'videos', value: profile.postsCount },
    { label: 'followers', value: profile.followersCount },
    { label: 'following', value: profile.followToCount },
  ];

  return (
    <section>
      {/* Banner: height is inline so it can never collapse */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          height: BANNER_HEIGHT,
          minHeight: BANNER_HEIGHT,
          background:
            'linear-gradient(90deg, #4c1d95 0%, #7c3aed 55%, #c026d3 100%)',
        }}
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        )}
      </div>

      {/* Avatar + identity + actions, overlapping the banner's bottom edge */}
      <div
        className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        style={{ marginTop: -AVATAR_SIZE / 2, paddingLeft: 24, paddingRight: 24 }}
      >
        <div className="flex items-end gap-5">
          <div
            className="relative shrink-0 overflow-hidden rounded-full bg-violet-600 shadow-xl"
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              border: `4px solid ${BG}`,
            }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={profile.username}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0" style={{ paddingBottom: 6 }}>
            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
              {profile.username}
            </h1>
            <p className="truncate text-sm text-slate-400">
              @{profile.username.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ paddingBottom: 6 }}>
          {isOwner ? (
            <Link
              href="/dashboard/settings/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </Link>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFollowToggle}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                profile.isFollowed
                  ? 'border border-white/15 bg-white/5 text-slate-200 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300'
                  : 'bg-violet-600 text-white hover:bg-violet-500'
              }`}
            >
              {profile.isFollowed ? (
                <Check className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmitting
                ? 'Please wait...'
                : profile.isFollowed
                  ? 'Following'
                  : 'Follow'}
            </button>
          )}

          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        className="text-sm text-slate-400"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: 24,
          rowGap: 4,
          marginTop: 20,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {stats.map((s) => (
          <span key={s.label}>
            <strong className="text-base font-bold text-white">
              {compact.format(s.value ?? 0)}
            </strong>{' '}
            {s.label}
          </span>
        ))}
      </div>

      {profile.bio && (
        <p
          className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-slate-300"
          style={{ marginTop: 12, paddingLeft: 24, paddingRight: 24 }}
        >
          {profile.bio}
        </p>
      )}
    </section>
  );
}