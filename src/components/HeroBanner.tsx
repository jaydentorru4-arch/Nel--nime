import React, { useState, useEffect } from 'react';
import { Play, Bookmark, BookmarkCheck, Info, ChevronRight, ChevronLeft, ShieldCheck, Check } from 'lucide-react';
import { Anime } from '../types/anime';

interface HeroBannerProps {
  featuredAnime: Anime[];
  onWatchNow: (anime: Anime) => void;
  onOpenDetails: (anime: Anime) => void;
  isBookmarked: (animeId: string) => boolean;
  onToggleBookmark: (anime: Anime) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredAnime,
  onWatchNow,
  onOpenDetails,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 8 seconds
  useEffect(() => {
    if (featuredAnime.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredAnime.length]);

  if (!featuredAnime.length) return null;

  const current = featuredAnime[currentIndex];
  const bookmarked = isBookmarked(current.id);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredAnime.length) % featuredAnime.length);
  };

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] md:h-[660px] overflow-hidden select-none bg-[#0f1014]">
      {/* Background Banner with deep gradients */}
      <div className="absolute inset-0">
        <img
          src={current.banner}
          alt={current.title}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 ease-out"
        />
        {/* Dark Vignette and Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/85 to-transparent sm:w-3/4"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1014]/40 via-transparent to-transparent"></div>
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          
          {/* Top Tagline / Category Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-violet-600/90 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-violet-600/30">
              #1 Spotlight
            </span>
            <span className="px-2.5 py-0.5 bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 font-semibold text-xs rounded-md">
              {current.quality} Ultra HD
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-900/90 border border-zinc-700/60 text-xs font-semibold text-emerald-400 rounded-md">
              <span className="font-mono text-zinc-200">Score</span>
              <span className="font-bold text-emerald-300">{current.score}</span>
              <span className="text-zinc-500 text-[10px]">/ 10</span>
            </div>
            <span className="text-xs font-semibold text-violet-300 bg-violet-950/60 border border-violet-800/40 px-2 py-0.5 rounded">
              {current.scorePercent}% Match
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {current.title}
            </h1>
            {current.japaneseTitle && (
              <p className="text-sm sm:text-base text-zinc-400 font-medium mt-1 tracking-wide">
                {current.japaneseTitle}
              </p>
            )}
          </div>

          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="px-2 py-0.5 bg-zinc-800/90 border border-zinc-700 rounded text-zinc-300 font-semibold">
              {current.ageRating}
            </span>
            <span>{current.year}</span>
            <span className="text-zinc-600">•</span>
            <span>{current.type}</span>
            <span className="text-zinc-600">•</span>
            <span>{current.episodesCount} Episodes</span>
            <span className="text-zinc-600">•</span>
            <span className="text-violet-400 font-semibold">{current.genres.slice(0, 3).join(', ')}</span>
          </div>

          {/* Synopsis */}
          <p className="text-zinc-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl text-shadow">
            {current.synopsis}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onWatchNow(current)}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-violet-600/35 hover:shadow-violet-600/50 hover:scale-102 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onToggleBookmark(current)}
              className={`flex items-center gap-2 px-5 py-3.5 font-semibold text-sm sm:text-base rounded-xl border backdrop-blur-sm transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-violet-950/60 border-violet-500/60 text-violet-300 hover:bg-violet-900/60'
                  : 'bg-zinc-900/80 border-zinc-700 hover:bg-zinc-800 text-white'
              }`}
            >
              {bookmarked ? (
                <>
                  <BookmarkCheck className="w-5 h-5 text-violet-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5 text-zinc-300" />
                  <span>Add to List</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenDetails(current)}
              className="flex items-center gap-2 px-4 py-3.5 bg-zinc-900/70 hover:bg-zinc-800/90 text-zinc-300 hover:text-white font-semibold text-sm rounded-xl border border-zinc-800 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows & Indicators */}
      <div className="absolute right-6 bottom-8 z-20 hidden sm:flex items-center gap-3">
        {/* Slide Indicators */}
        <div className="flex items-center gap-1.5 mr-2">
          {featuredAnime.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-violet-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        {/* Carousel buttons */}
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Previous featured anime"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Next featured anime"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
