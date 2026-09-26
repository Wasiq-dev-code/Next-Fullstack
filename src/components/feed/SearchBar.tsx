'use client';

import { useSearchVideoFeed } from "@/hooks/searchBar/SearchBar";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const value = formData.get('search');

        if (typeof value !== 'string') return;

        const query = value.trim();

        if (!query) return;

        onSearch(query);

        // try{
        //     useSearchVideoFeed(query)
        // } catch(error){
        //     console.error('Error on the Client comp while using useSearchVideoFeed', error);
        // } 
    }; // <--- ADD THIS CLOSING BRACE TO FIX THE ERROR

    return (
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
                type="text"
                name="search"
                placeholder="Search..."
                className="bg-gray-800 text-gray-300 placeholder:text-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                Search
            </button>
        </form>
    );
};
