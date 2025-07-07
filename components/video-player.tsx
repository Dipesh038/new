"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ExternalLink, Star, Calendar, Clock } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  movie: Movie | null;
  onClose: () => void;
}

// Add a type for episodes
interface Episode {
  id: string | number;
  number: number;
  title: string;
  description?: string;
}

export function VideoPlayer({ movie, onClose }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState('');
  // Season selector and episodes state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  // Detect if the content is anime (by genre or title)
  const isAnime = movie && (movie.genre?.some(g => g.toLowerCase().includes('animation') || g.toLowerCase().includes('anime')) || /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9faf]/.test(movie.title));
  // Special case: English audio for specific anime titles
  const forceEnglishAudioTitles = ['attack on titan', 'death note'];
  const isForceEnglishAudio = movie && forceEnglishAudioTitles.includes(movie.title.toLowerCase());
  // Language selection state
  const [selectedAudioLanguage, setSelectedAudioLanguage] = useState(isAnime ? 'ja' : 'en');
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: 'Japanese' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'it', label: 'Italian' },
    { code: 'ko', label: 'Korean' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'zh', label: 'Chinese' },
  ];

  console.log('VideoPlayer rendered with movie:', movie?.title);

  // If the movie changes, reset the default language
  useEffect(() => {
    if (isAnime) {
      setSelectedAudioLanguage('ja');
    } else {
      setSelectedAudioLanguage('en');
    }
  }, [movie]);

  useEffect(() => {
    if (movie) {
      console.log('Setting up video player for:', movie.title, 'IMDB ID:', movie.imdbId);
      setIsLoading(true);
      
      // VidSrc API URL construction
      const baseUrl = 'https://vidsrc.xyz/embed';
      let url = '';
      
      if (movie.type === 'movie') {
        url = `${baseUrl}/movie/${movie.imdbId}`;
        console.log('Movie URL constructed:', url);
      } else {
        url = `${baseUrl}/tv/${movie.imdbId}/${selectedSeason}/${selectedEpisode}`;
        console.log('TV show URL constructed:', url);
      }
      
      // Only add ?lang=en for non-anime; for anime, do not add any lang param
      if (!isAnime) {
        url += `?lang=en`;
      }
      
      setEmbedUrl(url);
      
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
        console.log('Video player loading completed');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [movie, selectedSeason, selectedEpisode, isAnime]);

  // Fetch episodes for selected season (generic API structure)
  useEffect(() => {
    if (movie && movie.type === 'tv') {
      setLoadingEpisodes(true);
      fetch(`/api/episodes?imdbId=${movie.imdbId}&season=${selectedSeason}`)
        .then(res => res.json())
        .then(data => setEpisodes(data.episodes || []))
        .catch(() => setEpisodes([]))
        .finally(() => setLoadingEpisodes(false));
      setSelectedEpisode(1); // Reset episode selection on season change
    }
  }, [movie, selectedSeason]);

  if (!movie) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            console.log('Video player backdrop clicked, closing');
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-6xl mx-auto bg-clip-padding-strong rounded-lg shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          {/* Close button */}
          <Button
            onClick={() => {
              console.log('Close button clicked');
              onClose();
            }}
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 z-10 bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Grid layout for player and details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto p-2 sm:p-6">
            {/* Left side: Video Player */}
            <div className="lg:col-span-1">
              {/* Audio Language Label */}
              <div className="mb-2 flex flex-col gap-2">
                <span className="inline-block bg-cinema-coral text-white px-3 py-1 rounded font-semibold text-sm w-fit">
                  {isForceEnglishAudio ? 'English Audio' : (isAnime ? 'Japanese Audio' : 'English Audio')}
                </span>
              </div>
              {/* Video embed */}
              <div className="relative bg-black rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: '16/9' }}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-cinema-charcoal">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-cinema-coral animate-spin mx-auto mb-4" />
                      <p className="text-cinema-white">Loading video...</p>
                      <p className="text-sm text-cinema-gray mt-2">
                        Connecting to VidSrc API
                      </p>
                    </div>
                  </div>
                )}
                
                <iframe
                  src={embedUrl}
                  className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 rounded-lg`}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  onLoad={() => {
                    console.log('Video iframe loaded successfully');
                    setIsLoading(false);
                  }}
                  onError={() => {
                    console.error('Video iframe failed to load');
                    setIsLoading(false);
                  }}
                />
              </div>
            </div>

            {/* Right side: Movie Details */}
            <div className="lg:col-span-1 flex flex-col pt-4 lg:pt-0 px-1 sm:px-4">
            {/* Movie info header */}
              <div className="mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-cinema-white mb-2">
                  {movie.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cinema-gray">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    <span>{movie.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.year}</span>
                  </div>
                  {movie.type === 'movie' && movie.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.duration}</span>
                    </div>
                  )}
                  <span className="bg-cinema-coral px-2 py-1 rounded text-xs font-medium text-white uppercase">
                    {movie.type}
                  </span>
                </div>
              </div>
              
              {/* Movie details */}
              <div className="space-y-4 flex-grow">
                <div>
                <h3 className="text-lg font-semibold text-cinema-white mb-2">Description</h3>
                <p className="text-cinema-gray leading-relaxed">{movie.description}</p>
              </div>
              
                <div>
                  <h3 className="text-lg font-semibold text-cinema-white mb-2">Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-cinema-gray">Genres:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genre.map((g, i) => (
                          <span 
                            key={i}
                            className="bg-cinema-dark text-cinema-white text-xs px-2 py-1 rounded-full"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {movie.type === 'tv' && (
                      <div>
                        <span className="text-cinema-gray">Seasons:</span>
                        <span className="text-cinema-white ml-2">{movie.seasons}</span>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-cinema-gray">IMDB ID:</span>
                      <span className="text-cinema-white ml-2 font-mono text-sm">{movie.imdbId}</span>
                    </div>
                  </div>
                </div>
                
                {/* Season Selector and Episode List for TV Series */}
                {movie.type === 'tv' && (movie.seasons ?? 1) > 1 && (
                  <div className="mt-4">
                    <label htmlFor="season-select" className="mr-2 font-semibold text-cinema-white">Season:</label>
                    <select
                      id="season-select"
                      value={selectedSeason}
                      onChange={e => setSelectedSeason(Number(e.target.value))}
                      className="p-2 rounded border bg-cinema-dark text-cinema-white focus:outline-none focus:ring-2 focus:ring-cinema-coral"
                    >
                      {Array.from({ length: movie.seasons ?? 1 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
                {movie.type === 'tv' && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-cinema-white mb-2">Episodes (Season {selectedSeason})</h3>
                    {loadingEpisodes ? (
                      <div className="text-cinema-gray">Loading episodes...</div>
                    ) : episodes.length > 0 ? (
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {episodes.map(ep => (
                          <li
                            key={ep.id ?? ep.number ?? ep.title}
                            className={`p-2 bg-cinema-dark rounded cursor-pointer transition-colors ${selectedEpisode === ep.number ? 'ring-2 ring-cinema-coral bg-cinema-coral/20' : ''}`}
                            onClick={() => setSelectedEpisode(ep.number)}
                          >
                            <span className="font-semibold">{ep.number ?? ''}. {ep.title ?? ''}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-cinema-gray">No episodes found for this season.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4">
                <Button
                  onClick={() => {
                    console.log('External link clicked for:', embedUrl);
                    window.open(embedUrl, '_blank');
                  }}
                  className="btn-secondary w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}