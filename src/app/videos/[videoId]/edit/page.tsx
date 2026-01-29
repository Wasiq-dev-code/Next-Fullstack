import ChangeVideoFields from './editPage';
type PageProps = {
  params: { videoId: string };
};

export default async function Page({ params }: PageProps) {
  const { videoId } = await params;
  return <ChangeVideoFields videoId={videoId} />;
}
