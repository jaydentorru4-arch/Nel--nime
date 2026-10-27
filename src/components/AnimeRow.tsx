import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface AnimeRowProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  animeList: Anime[];
  onSelect: (anime: Anime) => void;
  onPlay: (anime: Anime) => void;
  isBookmarked: (animeId: string) => boolean;
  onToggleBookmark: (anime: Anime) => void;
  onViewAll?: () => void;
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  icon,
  subtitle,
  animeList,
  onSelect,
  onPlay,
  isBookmarked,
  onToggleBookmark,
  onViewAll,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!animeList.length) return null;

  return (
    <div className="py-6 sm:py-8 space-y-4">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-violet-400">{icon}</span>}
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs sm:text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors mr-2 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Left / Right scroll navigation arrows */}
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={rowRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
      >
        {animeList.map((anime) => (
          <div
            key={anime.id}
            className="w-[170px] sm:w-[210px] md:w-[230px] flex-shrink-0"
          >
            <AnimeCard
              anime={anime}
              onSelect={onSelect}
              onPlay={onPlay}
              isBookmarked={isBookmarked(anime.id)}
              onToggleBookmark={onToggleBookmark}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
