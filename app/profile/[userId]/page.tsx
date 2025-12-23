'use client';
import ProfileInfo from '../components/ProfileInfo';
import ProfileVideos from '../components/ProfileVideos';

export default function page({ params }: { params: { userId: string } }) {
  return (
    <div>
      <ProfileInfo></ProfileInfo>
      <ProfileVideos></ProfileVideos>
    </div>
  );
}
