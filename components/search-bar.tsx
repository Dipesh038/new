"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onPerformSearch: (query: string) => void;
}

export function SearchBar({ onPerformSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onPerformSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies, series..."
          className="w-full pl-12 pr-4 py-3 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-cinema-white placeholder-cinema-gray focus:outline-none focus:ring-2 focus:ring-cinema-coral search-glow"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="w-6 h-6 text-cinema-gray" />
        </div>
      </div>
    </form>
  );
} 