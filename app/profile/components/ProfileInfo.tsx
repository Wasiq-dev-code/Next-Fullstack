'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Profile, ProfileResponse } from '@/lib/types/profile';

export default function ProfileInfo({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .profileInformation(userId)
      .then((res: ProfileResponse) => setProfile(res.profile))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading profile…</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <section className="mb-6">
      <img src={profile.profilePhoto} alt="" />
      <h1>{profile.username}</h1>

      <div className="flex gap-4 text-sm">
        <span>{profile.postsCount} posts</span>
        <span>{profile.followersCount} followers</span>
        <span>{profile.followToCount} following</span>
      </div>

      {!profile.isMe && (
        <button>{profile.isFollowed ? 'Unfollow' : 'Follow'}</button>
      )}
    </section>
  );
}
