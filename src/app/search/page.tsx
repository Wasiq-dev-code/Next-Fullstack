import SearchResults from '@/components/feed/searchResults';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>; // Next 15; on 14 it's a plain object
}) {
  const { q = '' } = await searchParams;
  // key remounts the component, which resets the infinite-scroll state per query
  return <SearchResults key={q} query={q} />;
}