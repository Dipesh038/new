"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap, Film, Tv, TrendingUp, Star, Search } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import { FloatingParticles } from '@/components/floating-particles';
import { NavigationTabs, TabType } from '@/components/navigation-tabs';
import { ContentSection } from '@/components/content-section';
import { SearchBar } from '@/components/search-bar';
import { 
  movieDatabase, 
  getMovies, 
  getSeries, 
  get4KContent, 
  getTrendingContent, 
  getTopRated,
  Movie 
} from '@/types/movie';

export default function Home() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [tmdbMovies, setTmdbMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [tmdbGenres, setTmdbGenres] = useState<{ id: number; name: string; type: 'movie' | 'tv' }[]>([]);
  const [genreError, setGenreError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '10eaebf12c139dadb28a57991cfce1a6';
      
      // 1. Search TMDB for movies and TV shows
      const searchRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
      const searchData = await searchRes.json();
      const searchItems = (searchData.results || [])
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
        .slice(0, 20); // Limit to top 20 results

      // 2. Fetch details to get imdb_id
      const itemDetailsPromises = searchItems.map(async (item: any) => {
        const detailRes = await fetch(`https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${apiKey}&append_to_response=external_ids`);
        const detailData = await detailRes.json();
        return { ...item, ...detailData };
      });
      const itemsWithDetails = await Promise.all(itemDetailsPromises);

      // 3. Map to our app's Movie type (removed availability check for reliability)
      const availableItems: Movie[] = itemsWithDetails
        .filter((item: any) => item.external_ids?.imdb_id) // Ensure we have an IMDB ID to play
        .map((item: any): Movie => ({
          id: item.id.toString(),
          title: item.title || item.name,
          year: item.release_date ? parseInt(item.release_date.slice(0, 4), 10) : (item.first_air_date ? parseInt(item.first_air_date.slice(0, 4), 10) : 0),
          poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          genre: (item.genres || []).map((g: any) => g.name),
          rating: item.vote_average,
          description: item.overview,
          imdbId: item.external_ids.imdb_id,
          type: item.media_type,
          duration: item.runtime ? `${item.runtime} min` : undefined,
          seasons: item.number_of_seasons,
        }));

      setSearchResults(availableItems);
    } catch (e) {
      console.error("Failed to perform search:", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    async function fetchAndFilterMovies() {
      setLoadingMovies(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '10eaebf12c139dadb28a57991cfce1a6';
        
        // Fetch multiple pages of popular movies
        const totalPagesToFetch = 5; // Fetch 5 pages = 100 movies
        let allMovies: any[] = [];

        for (let i = 1; i <= totalPagesToFetch; i++) {
          const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${i}`);
          const data = await res.json();
          allMovies = [...allMovies, ...(data.results || [])];
        }

        // Fetch details for each movie to get imdb_id and other info
        const moviePromises = allMovies.map(async (movie: any) => {
          const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=external_ids`);
          const detailData = await detailRes.json();
          return {
            ...movie,
            imdb_id: detailData.external_ids?.imdb_id,
            runtime: detailData.runtime,
            genres: detailData.genres,
          };
        });

        const detailedMovies = await Promise.all(moviePromises);

        const availableMovies: Movie[] = detailedMovies
          .filter((movie: any) => movie.poster_path && movie.imdb_id)
          .map((item: any): Movie => ({
            id: item.id.toString(),
            title: item.title,
            year: item.release_date ? parseInt(item.release_date.slice(0, 4), 10) : 0,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            genre: (item.genres || []).map((g: any) => g.name),
            rating: item.vote_average,
            description: item.overview,
            imdbId: item.imdb_id,
            type: 'movie',
            duration: item.runtime ? `${item.runtime} min` : '',
          }));

        setTmdbMovies(availableMovies);

      } catch (e) {
        console.error("Failed to fetch and filter movies:", e);
        setTmdbMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    }

    if (activeTab === 'movies') {
      fetchAndFilterMovies();
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchGenres() {
      setGenreError(null);
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '10eaebf12c139dadb28a57991cfce1a6';
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`),
          fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`)
        ]);
        const movieData = await movieRes.json();
        const tvData = await tvRes.json();
        const movieGenres = (movieData.genres || []).map((g: any) => ({ ...g, type: 'movie' as const }));
        const tvGenres = (tvData.genres || []).map((g: any) => ({ ...g, type: 'tv' as const }));
        setTmdbGenres([...movieGenres, ...tvGenres]);
      } catch (e) {
        setGenreError('Failed to fetch genres from TMDB.');
        setTmdbGenres([]);
      }
    }
    fetchGenres();
  }, []);

  // Remove console logs for production
  // console.log('VidStream app rendered with', movieDatabase.length, 'total content items');

  const handleMovieSelect = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Get content based on active tab
  const getActiveContent = () => {
    switch (activeTab) {
      case 'movies':
        return tmdbMovies.length > 0 ? tmdbMovies : [];
      case 'series':
        return getSeries();
      case '4k':
        return get4KContent();
      case 'top-rated':
        return getTopRated();
      case 'trending':
      default:
        return getTrendingContent();
    }
  };

  const getSectionConfig = (tab: TabType) => {
    switch (tab) {
      case 'movies':
        return {
          title: 'Movies Collection',
          icon: <Film className="w-8 h-8 text-cinema-coral" />,
          description: 'Discover thousands of amazing movies from every genre and era'
        };
      case 'series':
        return {
          title: 'TV Series',
          icon: <Tv className="w-8 h-8 text-cinema-teal" />,
          description: 'Binge-watch the best television series and shows'
        };
      case '4k':
        return {
          title: '4K Premium',
          icon: <Sparkles className="w-8 h-8 text-cinema-coral" />,
          description: 'Ultra high-quality content with exceptional ratings'
        };
      case 'top-rated':
        return {
          title: 'Top Rated',
          icon: <Star className="w-8 h-8 text-yellow-400" />,
          description: 'The highest rated movies and series according to critics and audiences'
        };
      case 'trending':
      default:
        return {
          title: 'Trending Now',
          icon: <TrendingUp className="w-8 h-8 text-cinema-coral" />,
          description: 'The hottest and most popular content right now'
        };
    }
  };

  // Memoize content and config for performance
  const activeContent = useMemo(() => getActiveContent(), [activeTab]);
  const sectionConfig = useMemo(() => getSectionConfig(activeTab), [activeTab]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <FloatingParticles />
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-3 glass-card-strong px-6 py-3 rounded-full">
              <Film className="w-8 h-8 text-cinema-coral" />
              <span className="text-2xl font-bold text-gradient">Movie Stream</span>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="mb-12">
            <SearchBar onPerformSearch={handleSearch} />
          </div>

          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-cinema-white mb-6 leading-tight"
          >
            Stream Everything
            <span className="block text-gradient">Beautifully</span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-cinema-gray mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of streaming with our premium platform. 
            Access over <span className="text-cinema-coral font-bold">{movieDatabase.length.toLocaleString()}+</span> movies and TV shows.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mb-12"
          >
            <div className="glass-card px-6 py-4 text-center">
              <div className="text-2xl font-bold text-cinema-coral">{getMovies().length.toLocaleString()}+</div>
              <div className="text-cinema-gray">Movies</div>
            </div>
            <div className="glass-card px-6 py-4 text-center">
              <div className="text-2xl font-bold text-cinema-teal">{getSeries().length.toLocaleString()}+</div>
              <div className="text-cinema-gray">TV Series</div>
            </div>
            <div className="glass-card px-6 py-4 text-center">
              <div className="text-2xl font-bold text-cinema-coral">{get4KContent().length.toLocaleString()}+</div>
              <div className="text-cinema-gray">4K Content</div>
            </div>
          </motion.div>

          {/* Hero Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6 mb-12"
          >
            <div className="flex items-center space-x-2 glass-card px-4 py-2">
              <Sparkles className="w-5 h-5 text-cinema-teal" />
              <span className="text-cinema-white">4K Quality</span>
            </div>
            <div className="flex items-center space-x-2 glass-card px-4 py-2">
              <Zap className="w-5 h-5 text-cinema-coral" />
              <span className="text-cinema-white">Instant Streaming</span>
            </div>
            <div className="flex items-center space-x-2 glass-card px-4 py-2">
              <Play className="w-5 h-5 text-cinema-teal" />
              <span className="text-cinema-white">No Ads</span>
            </div>
          </motion.div>
        </div>
      </section>

      <main id="content" className="px-4 md:px-8 pb-20 -mt-32 md:-mt-48 relative z-20 pt-20">
        {/* Content Sections */}
        {isSearching ? (
          <div className="text-center text-cinema-white py-20">Searching...</div>
        ) : searchResults.length > 0 ? (
          <ContentSection
            title="Search Results"
            icon={<Search className="w-8 h-8 text-cinema-teal" />}
            description={`Found ${searchResults.length} results`}
            movies={searchResults}
            onMovieSelect={handleMovieSelect}
            isLoading={isSearching}
          />
        ) : (
          <>
            <NavigationTabs onTabChange={handleTabChange} activeTab={activeTab} />
            <div className="mt-8">
              <ContentSection
                title={sectionConfig.title}
                icon={sectionConfig.icon}
                description={sectionConfig.description}
                movies={activeContent}
                onMovieSelect={handleMovieSelect}
                isLoading={loadingMovies}
              />
            </div>
          </>
        )}
      </main>
      
      {/* Video Player Modal */}
      {selectedMovie && (
          <VideoPlayer movie={selectedMovie} onClose={handleClosePlayer} />
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-cinema-dark text-center">
        <p className="text-cinema-gray mb-2">
          &copy; {new Date().getFullYear()} Dipesh. All Rights Reserved.
        </p>
        <p className="text-cinema-gray mb-4">
          Developed by <a href="https://github.com/Dipesh038" target="_blank" rel="noopener noreferrer" className="text-cinema-teal hover:text-cinema-coral underline">Dipesh</a>
        </p>
        <div className="flex justify-center space-x-4 text-sm text-cinema-gray">
          <span>Built with Next.js & Tailwind CSS</span>
        </div>
      </footer>
    </>
  );
}
