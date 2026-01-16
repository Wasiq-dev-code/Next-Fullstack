import ProfilePage from './layout';

type PageProps = {
  params: { userId: string };
};
export default async function page({ params }: PageProps) {
  const { userId } = await params;
  return (
    <div>
      <ProfilePage userId={userId}></ProfilePage>
    </div>
  );
}
