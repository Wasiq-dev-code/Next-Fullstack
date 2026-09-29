'use client';

import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = new FormData(event.currentTarget).get('search');
    if (typeof value !== 'string') return;

    const query = value.trim();
    if (!query) return;

    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex h-10 w-140 items-center gap-1 rounded-xl border border-white/10 bg-[#20222b] p-1 transition focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 ml-34"
    >
      <Search className="ml-3 h-4 w-4 shrink-0 text-gray-500" />
      <input
        type="text"
        name="search"
        placeholder="Search videos..."
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
      />
      <button
        type="submit"
        className="h-full cursor-pointer rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition hover:bg-violet-500"
      >
        Search
      </button>
    </form>
  );
};