"use client";

import { Movie } from '@/types/movie';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Play } from 'lucide-react';
import React, { useEffect, useState, memo, useRef } from 'react';
import { OptimizedImage } from './image-optimizer';

interface LazyVideoCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  index: number;
}

export const LazyVideoCard = memo(function LazyVideoCard({ movie, onPlay, index }: LazyVideoCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(movie.poster);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchPosterFromAPI = async () => {
    if (!movie.imdbId) return;
    try {
      const apiKey = '10eaebf12c139dadb28a57991cfce1a6';
      const res = await fetch(`https://api.themoviedb.org/3/find/${movie.imdbId}?api_key=${apiKey}&external_source=imdb_id`);
      const data = await res.json();
      let posterPath = null;
      if (movie.type === 'movie' && data.movie_results && data.movie_results[0]) {
        posterPath = data.movie_results[0].poster_path;
      } else if (movie.type === 'tv' && data.tv_results && data.tv_results[0]) {
        posterPath = data.tv_results[0].poster_path;
      }
      if (posterPath) {
        setPosterUrl(`https://image.tmdb.org/t/p/w500${posterPath}`);
      } else {
        setPosterUrl(null);
      }
    } catch (e) {
      setPosterUrl(null);
    }
  };

  const handleClick = () => {
    onPlay(movie);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(movie);
    }
  };

  return (
    <div ref={cardRef} className="w-full">
      {isVisible ? (
        <motion.article
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.3 }
          }}
          className="video-card group cursor-pointer contain-layout"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`Play ${movie.title} (${movie.year})`}
        >
          <div className="relative overflow-hidden rounded-lg mb-4">
            {posterUrl ? (
              <OptimizedImage
                src={posterUrl}
                alt={`${movie.title} movie poster`}
                width={300}
                height={450}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                onError={fetchPosterFromAPI}
                loading="lazy"
              />
            ) : (
              <div 
                className="w-full h-64 bg-cinema-dark flex items-center justify-center text-cinema-gray" 
                role="img" 
                aria-label="No poster available"
              >
                No Image
              </div>
            )}
            
            {/* Overlay with play button */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="bg-cinema-coral rounded-full p-4 shadow-lg"
                aria-hidden="true"
              >
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </motion.div>
            </div>
            
            {/* Rating badge */}
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" aria-hidden="true" />
              <span className="text-xs font-medium text-white" aria-label={`Rating: ${movie.rating} out of 10`}>
                {movie.rating}
              </span>
            </div>
            
            {/* Type badge */}
            <div className="absolute top-3 left-3 bg-cinema-coral/90 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-xs font-medium text-white uppercase">
                {movie.type}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-cinema-white group-hover:text-cinema-coral transition-colors duration-300 line-clamp-1">
              {movie.title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-cinema-gray">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>{movie.year}</span>
              </div>
              
              {movie.type === 'movie' && movie.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{movie.duration}</span>
                </div>
              )}
              
              {movie.type === 'tv' && (
                <div className="flex items-center space-x-1">
                  <span>{movie.seasons} Season{movie.seasons !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {movie.genre.slice(0, 2).map((g, i) => (
                <span 
                  key={i}
                  className="bg-cinema-dark text-cinema-white text-xs px-2 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
            
            <p className="text-sm text-cinema-gray line-clamp-2 group-hover:text-cinema-white transition-colors duration-300">
              {movie.description}
            </p>
          </div>
        </motion.article>
      ) : (
        <div className="video-card lazy-loading h-96 rounded-lg" aria-hidden="true" />
      )}
    </div>
  );
});