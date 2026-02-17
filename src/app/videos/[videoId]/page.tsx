import SingleVideoPage from '@/app/videos/[videoId]/SingleVideoClient';

type PageProps = {
  params: { videoId: string };
};

export default async function Page({ params }: PageProps) {
  const { videoId } = await params;
  return <SingleVideoPage videoId={videoId} />;
}
