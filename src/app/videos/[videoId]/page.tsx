import SingleVideoClient from './SingleVideoClient';

type PageProps = {
  params: { videoId: string };
};

export default async function Page({ params }: PageProps) {
  const { videoId } = await params;
  return <SingleVideoClient videoId={videoId} />;
}
