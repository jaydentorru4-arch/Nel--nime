import React from 'react';
import { Play, Bookmark, BookmarkCheck, Info } from 'lucide-react';
import { Anime } from '../types/anime';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  onPlay: (anime: Anime) => void;
  isBookmarked: boolean;
  onToggleBookmark: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  onPlay,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <div
      onClick={() => onPlay(anime)}
      className="group relative flex flex-col w-full bg-[#14151a] rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-violet-500/70 hover:shadow-2xl hover:shadow-violet-900/20 transition-all duration-300 cursor-pointer select-none"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14151a] via-transparent to-black/40 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {/* Numerical Score badge (NO star icon) */}
          <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-700/60 flex items-center gap-1 text-xs font-semibold text-zinc-100">
            <span className="text-[10px] uppercase font-bold text-violet-400">Score</span>
            <span className="text-emerald-400 font-bold">{anime.score}</span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(anime);
            }}
            aria-label={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/40'
                : 'bg-black/65 border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-black/90'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Bottom Badges on Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-zinc-300 z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-zinc-700/60 text-zinc-200">
            {anime.seasons && anime.seasons.length > 1
              ? `${anime.seasons.length} Seasons`
              : anime.type === 'Movie'
              ? 'Movie'
              : `Ep ${anime.episodesCount}`}
          </span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/40 text-[10px]">
              {anime.quality}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-900/80 text-zinc-300 border border-zinc-700/50 text-[10px]">
              {anime.audio.join(' • ')}
            </span>
          </div>
        </div>

        {/* Hover Center Quick Play Overlay Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px] z-20">
          <div className="w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-xl shadow-violet-600/60 group-hover:scale-110 active:scale-95 transition-all">
            <Play className="w-7 h-7 fill-current ml-0.5 text-white" />
          </div>
        </div>
      </div>

      {/* Card Details Footer */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
              {anime.title}
            </h3>
            {/* Info button to open full details page */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(anime);
              }}
              className="p-1 text-zinc-500 hover:text-violet-400 rounded transition-colors"
              title="View anime synopsis & details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
            {anime.genres.slice(0, 2).join(' • ')}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/60 text-xs text-zinc-400 font-medium">
          <span>{anime.year}</span>
          <span className="px-1.5 py-0.5 bg-zinc-800/80 text-zinc-300 rounded text-[10px] font-semibold">
            {anime.ageRating}
          </span>
          <span className="text-violet-400 font-semibold truncate max-w-[100px]">
            {anime.studio}
          </span>
        </div>
      </div>
    </div>
  );
};
