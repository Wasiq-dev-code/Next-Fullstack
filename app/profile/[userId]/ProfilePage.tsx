'use client';
import ProfileInfo from '../components/ProfileInfo';
import ProfileVideos from '../components/ProfileVideos';

export default function ProfilePage({ userId }: { userId: string }) {
  return (
    <div>
      <ProfileInfo userId={userId}></ProfileInfo>
      <ProfileVideos userId={userId}></ProfileVideos>
    </div>
  );
}
