import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileVideos from '@/components/profile/ProfileVideos';

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 sm:px-6"
      style={{ paddingTop: 24, paddingBottom: 48 }}
    >
      <ProfileInfo userId={userId} />
      <ProfileVideos userId={userId} />
    </div>
  );
}