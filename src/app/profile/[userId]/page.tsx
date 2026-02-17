import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileVideos from '@/components/profile/ProfileVideos';

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;

  return (
    <>
      <ProfileInfo userId={userId} />
      <ProfileVideos userId={userId} />
    </>
  );
}
