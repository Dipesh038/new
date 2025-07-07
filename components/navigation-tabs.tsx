"use client";

import { TrendingUp, Film, Tv, Sparkles, Star } from 'lucide-react';

export type TabType = 'trending' | 'movies' | 'series' | '4k' | 'top-rated';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'movies', label: 'Movies', icon: <Film className="w-5 h-5" /> },
  { id: 'series', label: 'Series', icon: <Tv className="w-5 h-5" /> },
  { id: '4k', label: '4K', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'top-rated', label: 'Top Rated', icon: <Star className="w-5 h-5" /> },
];

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="mb-8 flex justify-center">
      <div className="glass-card flex items-center p-2 rounded-full space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
              activeTab === tab.id
                ? 'bg-cinema-coral text-white'
                : 'text-cinema-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 