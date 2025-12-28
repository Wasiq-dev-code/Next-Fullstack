'use client';
import ProfileInfo from '../components/ProfileInfo';
import ProfileVideos from '../components/ProfileVideos';

export default function page({ params }: { params: { userId: string } }) {
  const { userId } = params;
  return (
    <div>
      <ProfileInfo userId={userId}></ProfileInfo>
      <ProfileVideos userId={userId}></ProfileVideos>
    </div>
  );
}
